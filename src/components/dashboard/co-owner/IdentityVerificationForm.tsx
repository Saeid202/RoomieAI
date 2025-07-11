
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

const identityVerificationSchema = z.object({
  idType: z.enum([
    "Passport", 
    "Driving License", 
    "PR card", 
    "Other Government issue card"
  ]),
  documentFile: z.any().optional(),
});

type IdentityVerificationFormValues = z.infer<typeof identityVerificationSchema>;

export function IdentityVerificationForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const form = useForm<IdentityVerificationFormValues>({
    resolver: zodResolver(identityVerificationSchema),
    defaultValues: {
      idType: "Passport",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      form.setValue("documentFile", file);
    }
  };

  const onSubmit = async (data: IdentityVerificationFormValues) => {
    setLoading(true);
    try {
      // Here you would upload the file and save the form data
      console.log("Form data to save:", data);
      
      toast({
        title: "Success",
        description: "Identity document uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading identity document:", error);
      toast({
        title: "Error",
        description: "Failed to upload identity document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Identity Verification</h2>
        <p className="text-muted-foreground">
          Please provide a valid identification document to verify your identity.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="idType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Type of Identification Document *
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Passport">Passport</SelectItem>
                    <SelectItem value="Driving License">Driving License</SelectItem>
                    <SelectItem value="PR card">PR card</SelectItem>
                    <SelectItem value="Other Government issue card">Other Government issue card</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="documentFile"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>
                  Upload Identification Document *
                </FormLabel>
                <FormControl>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Input
                      id="documentFile"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      {...field}
                      className="cursor-pointer"
                    />
                  </div>
                </FormControl>
                {fileName && (
                  <p className="text-sm text-muted-foreground">
                    Selected file: {fileName}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Uploading..." : "Upload & Verify Identity"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
