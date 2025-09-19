export function encodeBase64(input: string): string {
  return btoa(input);
}

export function decodeBase64(input: string): string {
  return atob(input);
}

export function encodeBase64UrlSafe(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeBase64UrlSafe(input: string): string {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  while (input.length % 4) input += '=';
  return atob(input);
}

export function generateDataUri(input: string): string {
  try {
    // Check if input is already a valid data URI
    if (input.startsWith('data:')) {
      return input;
    }

    // Try to decode base64 to determine the MIME type
    const decoded = atob(input);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }

    // Check for common file signatures
    const mimeType = detectMimeType(bytes);
    return `data:${mimeType};base64,${input}`;
  } catch {
    // If decoding fails, assume it's text
    return `data:text/plain;base64,${btoa(input)}`;
  }
}

export function generateHexDump(input: string): string {
  try {
    const decoded = atob(input);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }

    let hexDump = '';
    const bytesPerLine = 16;
    
    for (let i = 0; i < bytes.length; i += bytesPerLine) {
      // Offset
      hexDump += i.toString(16).padStart(8, '0') + '  ';
      
      // Hex values
      const lineBytes = bytes.slice(i, i + bytesPerLine);
      for (let j = 0; j < bytesPerLine; j++) {
        if (j < lineBytes.length) {
          hexDump += lineBytes[j].toString(16).padStart(2, '0') + ' ';
        } else {
          hexDump += '   ';
        }
        if (j === 7) hexDump += ' ';
      }
      
      // ASCII representation
      hexDump += ' |';
      for (let j = 0; j < lineBytes.length; j++) {
        const byte = lineBytes[j];
        hexDump += byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.';
      }
      hexDump += '|\n';
    }
    
    return hexDump;
  } catch (error) {
    return 'Invalid base64 input';
  }
}

function detectMimeType(bytes: Uint8Array): string {
  // Check for common file signatures (magic numbers)
  if (bytes.length >= 2) {
    // Check for common image formats
    if (bytes[0] === 0xFF && bytes[1] === 0xD8) return 'image/jpeg';
    if (bytes[0] === 0x89 && bytes[1] === 0x50) return 'image/png';
    if (bytes[0] === 0x47 && bytes[1] === 0x49) return 'image/gif';
    
    // Check for PDF
    if (bytes[0] === 0x25 && bytes[1] === 0x50) return 'application/pdf';
  }
  
  // Default to octet-stream if type cannot be determined
  return 'application/octet-stream';
}