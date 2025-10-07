// Use the global AbortController available in modern Node.js and browsers

interface ProcessRequest {
  operation: string;
  file_keys: string[];
  options?: Record<string, any>;
}

interface StatusResponse {
  status: string;
  download_url?: string | null;
  error?: string | null;
}

class DocumentService {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string, timeout: number = 30000) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.timeout = timeout;
  }

  private async makeRequest(
    method: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${this.baseUrl}/${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        signal: controller.signal,
        ...options,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: HTTP ${response.status}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  }

  async getUploadUrl(fileName: string): Promise<Record<string, any>> {
    const params = new URLSearchParams({ file_name: fileName });
    const response = await this.makeRequest('GET', `upload-url?${params.toString()}`);
    return response.json();
  }

  async processDocument(request: ProcessRequest): Promise<Record<string, string>> {
    const body: any = {
      operation: request.operation,
      file_keys: request.file_keys,
    };
    if (request.options) {
      body.options = request.options;
    }

    const response = await this.makeRequest('POST', 'process', {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return response.json();
  }

  async getStatus(jobId: string): Promise<StatusResponse> {
    const response = await this.makeRequest('GET', `status/${jobId}`);
    return response.json();
  }

  async getDebugConfig(): Promise<Record<string, any>> {
    const response = await this.makeRequest('GET', 'debug-config');
    return response.json();
  }
}

export { DocumentService };
export type { ProcessRequest, StatusResponse };
