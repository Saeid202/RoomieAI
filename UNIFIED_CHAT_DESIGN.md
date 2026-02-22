# 🤖 Unified AI Chat Interface - Design Document

## 🎯 Concept Overview

A single chat interface that serves dual purposes:
1. **Document Processing**: User can trigger document processing via chat commands
2. **Q&A Assistant**: User can ask questions about processed documents

## 🎨 User Experience Flow

### Scenario 1: New Property (No Documents Processed)

```
┌─────────────────────────────────────────────────────────┐
│  AI Property Assistant                            [X]    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🤖 AI Assistant:                                       │
│  Hello! I'm your AI Property Assistant. I can help you  │
│  understand this property's documents.                   │
│                                                          │
│  I see you have 3 documents uploaded but not yet        │
│  processed. Would you like me to process them?          │
│                                                          │
│  💡 Quick Actions:                                      │
│  [Process All Documents] [Ask a Question]               │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ Type "process documents" or ask a question...   │    │
│  └────────────────────────────────────────────────┘    │
│                                                    [Send]│
└─────────────────────────────────────────────────────────┘
```

### Scenario 2: User Types "process documents"

```
┌─────────────────────────────────────────────────────────┐
│  👤 You:                                                │
│  process documents                                       │
│                                                          │
│  🤖 AI Assistant:                                       │
│  I'll process your documents now. This will take a few  │
│  minutes depending on the size.                         │
│                                                          │
│  📄 Processing:                                         │
│  ✅ Title Deed (859 chunks) - Completed                │
│  ⏳ Condo Bylaws - Processing... 45%                   │
│  ⏸️ Property Inspection - Queued                       │
│                                                          │
│  I'll let you know when everything is ready!            │
└─────────────────────────────────────────────────────────┘
```

### Scenario 3: Processing Complete

```
┌─────────────────────────────────────────────────────────┐
│  🤖 AI Assistant:                                       │
│  ✅ All documents processed successfully!               │
│                                                          │
│  I've analyzed:                                         │
│  • Title Deed (859 chunks)                              │
│  • Condo Bylaws (1,234 chunks)                          │
│  • Property Inspection (456 chunks)                     │
│                                                          │
│  You can now ask me anything about these documents!     │
│                                                          │
│  💡 Try asking:                                         │
│  • "What are the pet policies?"                         │
│  • "Tell me about maintenance fees"                     │
│  • "What did the inspection find?"                      │
└─────────────────────────────────────────────────────────┘
```

### Scenario 4: Normal Q&A

```
┌─────────────────────────────────────────────────────────┐
│  👤 You:                                                │
│  What are the pet policies?                             │
│                                                          │
│  🤖 AI Assistant:                                       │
│  According to the Condo Bylaws, pets are allowed with   │
│  the following restrictions:                            │
│  • Maximum 2 pets per unit                              │
│  • Dogs must be under 25 lbs                            │
│  • Cats are unrestricted                                │
│  • All pets must be registered with management          │
│                                                          │
│  Source: Governance - Condo Bylaws, Section 4.2         │
│  [View Sources]                                          │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Special Commands

### Processing Commands
- `"process documents"` - Process all unprocessed documents
- `"process [document_type]"` - Process specific document type
- `"reprocess documents"` - Reprocess all documents
- `"processing status"` - Show current processing status

### Information Commands
- `"what documents do you have?"` - List all processed documents
- `"show document list"` - Display document inventory
- `"help"` - Show available commands

### Regular Questions
- Any other text is treated as a question about the documents

## 🔧 Technical Implementation

### 1. Enhanced Chat Edge Function

The `ai-property-assistant` Edge Function will:
1. Detect if message is a command or question
2. Route to appropriate handler
3. Return appropriate response

### 2. Command Detection Logic

```typescript
function detectIntent(message: string): 'command' | 'question' {
  const commandKeywords = [
    'process',
    'reprocess',
    'status',
    'help',
    'list documents',
    'show documents'
  ];
  
  const lowerMessage = message.toLowerCase().trim();
  
  for (const keyword of commandKeywords) {
    if (lowerMessage.includes(keyword)) {
      return 'command';
    }
  }
  
  return 'question';
}
```

### 3. Command Handlers

```typescript
async function handleCommand(
  command: string,
  propertyId: string,
  userId: string
): Promise<CommandResponse> {
  const lowerCommand = command.toLowerCase();
  
  if (lowerCommand.includes('process')) {
    return await handleProcessCommand(propertyId, userId);
  }
  
  if (lowerCommand.includes('status')) {
    return await handleStatusCommand(propertyId);
  }
  
  if (lowerCommand.includes('help')) {
    return handleHelpCommand();
  }
  
  // Default: treat as question
  return null;
}
```

### 4. Process Command Handler

```typescript
async function handleProcessCommand(
  propertyId: string,
  userId: string
): Promise<CommandResponse> {
  // Get unprocessed documents
  const { data: documents } = await supabase
    .from('property_documents')
    .select('id, file_url, document_type, document_label')
    .eq('property_id', propertyId)
    .is('deleted_at', null);
  
  // Check which are unprocessed
  const { data: statuses } = await supabase
    .from('property_document_processing_status')
    .select('document_id, status')
    .eq('property_id', propertyId);
  
  const processedIds = new Set(
    statuses?.filter(s => s.status === 'completed').map(s => s.document_id)
  );
  
  const unprocessed = documents?.filter(d => !processedIds.has(d.id)) || [];
  
  if (unprocessed.length === 0) {
    return {
      type: 'info',
      message: 'All documents are already processed! You can ask me questions now.',
    };
  }
  
  // Trigger processing for each document
  const results = [];
  for (const doc of unprocessed) {
    try {
      await supabase.functions.invoke('process-property-document-simple', {
        body: {
          documentId: doc.id,
          propertyId,
          documentUrl: doc.file_url,
          documentType: doc.document_type,
        },
      });
      results.push({ doc: doc.document_label, status: 'started' });
    } catch (error) {
      results.push({ doc: doc.document_label, status: 'failed' });
    }
  }
  
  return {
    type: 'processing',
    message: `I'm processing ${unprocessed.length} document(s). This will take a few minutes.`,
    documents: results,
  };
}
```

## 🎨 UI Enhancements

### 1. Welcome Message

When chat opens, show context-aware welcome:

```typescript
function getWelcomeMessage(readiness: PropertyAIReadiness): string {
  if (readiness.totalDocuments === 0) {
    return "Hello! Upload some documents first, then I can help you understand them.";
  }
  
  if (readiness.processedDocuments === 0) {
    return `I see you have ${readiness.totalDocuments} document(s) uploaded. Type "process documents" to get started!`;
  }
  
  if (readiness.processingDocuments > 0) {
    return `I'm currently processing ${readiness.processingDocuments} document(s). You can ask questions about the ${readiness.processedDocuments} already completed!`;
  }
  
  return `All ${readiness.totalDocuments} documents are ready! Ask me anything about this property.`;
}
```

### 2. Quick Action Buttons

Add contextual quick action buttons:

```typescript
function getQuickActions(readiness: PropertyAIReadiness): QuickAction[] {
  const actions: QuickAction[] = [];
  
  if (readiness.pendingDocuments > 0) {
    actions.push({
      label: `Process ${readiness.pendingDocuments} Document(s)`,
      command: 'process documents',
      icon: '⚡',
    });
  }
  
  if (readiness.processedDocuments > 0) {
    actions.push(
      { label: 'What are the pet policies?', icon: '🐕' },
      { label: 'Tell me about fees', icon: '💰' },
      { label: 'Show document list', command: 'list documents', icon: '📄' }
    );
  }
  
  return actions;
}
```

### 3. Processing Progress Display

Show real-time processing progress in chat:

```typescript
interface ProcessingUpdate {
  documentId: string;
  documentLabel: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  totalChunks?: number;
}

// Display in chat as a live-updating component
<ProcessingProgressCard updates={processingUpdates} />
```

## 📊 Database Changes

### Add Command History Table

```sql
CREATE TABLE ai_chat_commands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  command TEXT NOT NULL,
  command_type TEXT NOT NULL, -- 'process', 'status', 'help', etc.
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_commands_property ON ai_chat_commands(property_id);
CREATE INDEX idx_chat_commands_user ON ai_chat_commands(user_id);
```

## 🔔 Real-time Updates

Use Supabase Realtime to show processing progress:

```typescript
// Subscribe to processing status changes
const subscription = supabase
  .channel(`property:${propertyId}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'property_document_processing_status',
      filter: `property_id=eq.${propertyId}`,
    },
    (payload) => {
      // Update UI with new status
      updateProcessingStatus(payload.new);
    }
  )
  .subscribe();
```

## 🎯 Benefits

### For Users
1. **Single Interface**: One place for all AI interactions
2. **Control**: User decides when to process documents
3. **Transparency**: See processing progress in real-time
4. **Flexibility**: Can ask questions while processing continues

### For System
1. **Reduced Auto-Processing**: No need for automatic triggers
2. **Better Error Handling**: User can retry failed processing
3. **Cost Control**: Only process when user requests
4. **Better UX**: User understands what's happening

## 🚀 Implementation Plan

### Phase 1: Command Detection (30 min)
- Add command detection logic to Edge Function
- Implement basic command routing
- Test with "process documents" command

### Phase 2: Process Command Handler (1 hour)
- Implement document processing trigger
- Add status checking
- Return processing updates

### Phase 3: UI Enhancements (1 hour)
- Add welcome message logic
- Add quick action buttons
- Add processing progress display

### Phase 4: Real-time Updates (30 min)
- Set up Realtime subscription
- Update UI on status changes
- Show completion notifications

### Phase 5: Additional Commands (30 min)
- Implement "status" command
- Implement "help" command
- Implement "list documents" command

## 📝 Example Conversations

### Example 1: First Time User

```
🤖: Hello! I see you have 3 documents uploaded. Type "process documents" to analyze them, then you can ask me questions!

👤: process documents

🤖: I'm processing 3 documents now:
    ⏳ Title Deed - Processing...
    ⏸️ Condo Bylaws - Queued
    ⏸️ Property Inspection - Queued
    
    This will take 2-3 minutes. I'll notify you when ready!

[2 minutes later]

🤖: ✅ All documents processed! You can now ask me anything.

👤: What are the pet policies?

🤖: [Provides answer with citations]
```

### Example 2: Checking Status

```
👤: status

🤖: Processing Status:
    ✅ 2 documents completed (1,093 chunks)
    ⏳ 1 document processing (45% complete)
    
    You can ask questions about the completed documents now!
```

### Example 3: Help Command

```
👤: help

🤖: Here's what I can do:
    
    📄 Document Processing:
    • "process documents" - Process all unprocessed documents
    • "processing status" - Check processing progress
    
    💬 Ask Questions:
    • Just type your question naturally!
    • Example: "What are the pet policies?"
    
    📋 Information:
    • "list documents" - Show all processed documents
    • "help" - Show this message
```

## 🎉 Success Metrics

- **User Engagement**: % of users who use chat vs just viewing documents
- **Processing Adoption**: % of users who trigger processing via chat
- **Question Quality**: Types of questions users ask
- **Response Satisfaction**: User feedback on AI responses
- **Processing Success Rate**: % of documents processed successfully

---

**Next Step**: Implement Phase 1 (Command Detection) in the Edge Function! 🚀
