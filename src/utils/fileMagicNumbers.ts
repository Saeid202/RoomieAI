/**
 * Magic number / file signature verification.
 *
 * Browsers report `file.type` based on the file extension, which can be
 * trivially spoofed (e.g. rename `malware.exe` → `photo.jpg`).
 * Reading the first few bytes and comparing against known signatures
 * provides a second, independent layer of validation.
 */

export interface MagicNumberEntry {
  mimeType: string;
  /** Byte offset at which the signature starts (usually 0) */
  offset: number;
  /** Expected bytes as a hex string, e.g. "ffd8ff" */
  hex: string;
}

/** Known file signatures keyed by MIME type */
export const FILE_SIGNATURES: MagicNumberEntry[] = [
  // JPEG – FF D8 FF
  { mimeType: 'image/jpeg', offset: 0, hex: 'ffd8ff' },
  // PNG – 89 50 4E 47 0D 0A 1A 0A
  { mimeType: 'image/png', offset: 0, hex: '89504e470d0a1a0a' },
  // GIF87a / GIF89a
  { mimeType: 'image/gif', offset: 0, hex: '474946383761' },
  { mimeType: 'image/gif', offset: 0, hex: '474946383961' },
  // WebP – RIFF????WEBP (check bytes 0-3 and 8-11)
  { mimeType: 'image/webp', offset: 0, hex: '52494646' }, // "RIFF" – paired with webp check below
  // PDF – %PDF
  { mimeType: 'application/pdf', offset: 0, hex: '25504446' },
  // DOC (OLE2 Compound Document) – D0 CF 11 E0
  { mimeType: 'application/msword', offset: 0, hex: 'd0cf11e0' },
  // DOCX / XLSX / PPTX (ZIP-based Office Open XML) – PK\x03\x04
  { mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', offset: 0, hex: '504b0304' },
  { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', offset: 0, hex: '504b0304' },
  { mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', offset: 0, hex: '504b0304' },
];

/** How many bytes we need to read (longest signature + max offset) */
const MAX_BYTES_NEEDED = 12;

/**
 * Read the first `MAX_BYTES_NEEDED` bytes of a File as a hex string.
 */
function readFileHeader(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const slice = file.slice(0, MAX_BYTES_NEEDED);
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer;
      const bytes = new Uint8Array(buffer);
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      resolve(hex);
    };
    reader.onerror = () => reject(new Error('Failed to read file header'));
    reader.readAsArrayBuffer(slice);
  });
}

/**
 * Verify that a file's actual bytes match at least one known signature for
 * the given MIME type.
 *
 * Special case: WebP files start with "RIFF" (bytes 0-3) AND have "WEBP"
 * at bytes 8-11, so we do an extra check for that type.
 *
 * @returns `true` if the magic numbers match, `false` otherwise.
 */
export async function verifyFileMagicNumber(file: File, mimeType: string): Promise<boolean> {
  try {
    const header = await readFileHeader(file);

    // WebP needs a compound check: RIFF at 0 AND WEBP at offset 8
    if (mimeType === 'image/webp') {
      const riff = header.startsWith('52494646'); // "RIFF"
      const webp = header.slice(16, 24) === '57454250'; // "WEBP" at byte offset 8
      return riff && webp;
    }

    const signatures = FILE_SIGNATURES.filter((s) => s.mimeType === mimeType);
    if (signatures.length === 0) {
      // No known signature for this type – allow but log a warning
      console.warn(`[fileMagicNumbers] No signature registered for MIME type: ${mimeType}`);
      return true;
    }

    return signatures.some((sig) => {
      const startHex = sig.offset * 2; // each byte = 2 hex chars
      const candidate = header.slice(startHex, startHex + sig.hex.length);
      return candidate === sig.hex;
    });
  } catch (err) {
    console.error('[fileMagicNumbers] Error reading file header:', err);
    return false;
  }
}

/**
 * Full file validation: checks both the declared MIME type against an
 * allowlist AND verifies the actual file signature.
 *
 * @param file           The File object to validate
 * @param allowedTypes   Array of permitted MIME type strings
 * @returns `{ valid: boolean; error?: string }`
 */
export async function validateFileWithMagicNumber(
  file: File,
  allowedTypes: string[]
): Promise<{ valid: boolean; error?: string }> {
  // 1. MIME type allowlist check (fast, synchronous-ish)
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }

  // 2. Magic number / file signature check
  const signatureValid = await verifyFileMagicNumber(file, file.type);
  if (!signatureValid) {
    return {
      valid: false,
      error: 'File content does not match its declared type. The file may be corrupted or malicious.',
    };
  }

  return { valid: true };
}
