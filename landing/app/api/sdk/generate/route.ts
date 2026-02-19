import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { validateSpecification } from '@/lib/spec-validation';
import { storeSDK } from '@/lib/sdk-storage';
import { updateUserData, getUserById } from '@/lib/user-storage';

interface GenerateRequest {
  projectName: string;
  apiSpec: string;
  targetLanguages: string[];
}

// Simple in-memory SDK storage
const generatedSDKs: Map<string, any> = new Map();

/**
 * Generate SDK from OpenAPI specification
 */
async function generateSDKFromOpenAPI(
  spec: string,
  projectName: string,
  languages: string[]
): Promise<{ id: string; files: { [key: string]: string } }> {
  const specObj = JSON.parse(spec);
  const sdkId = `sdk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const files: { [key: string]: string } = {};

  // Generate basic SDK structure for each language
  for (const lang of languages) {
    switch (lang) {
      case 'typescript':
        files[`${projectName}.ts`] = generateTypeScriptSDK(specObj, projectName);
        files['types.ts'] = generateTypeScriptTypes(specObj);
        break;
      case 'python':
        files[`${projectName}.py`] = generatePythonSDK(specObj, projectName);
        break;
      case 'go':
        files[`${projectName}.go`] = generateGoSDK(specObj, projectName);
        break;
      case 'java':
        files[`${projectName}.java`] = generateJavaSDK(specObj, projectName);
        break;
      case 'csharp':
        files[`${projectName}.cs`] = generateCSharpSDK(specObj, projectName);
        break;
      case 'rust':
        files[`${projectName}.rs`] = generateRustSDK(specObj, projectName);
        break;
    }
  }

  // Add package.json for TypeScript/JavaScript
  if (languages.includes('typescript')) {
    files['package.json'] = JSON.stringify(
      {
        name: projectName,
        version: '1.0.0',
        description: `SDK generated from ${specObj.info?.title || 'API'}`,
        main: 'dist/index.js',
        types: 'dist/index.d.ts',
        scripts: {
          build: 'tsc',
          test: 'jest',
        },
        dependencies: {
          axios: '^1.6.0',
        },
        devDependencies: {
          typescript: '^5.0.0',
        },
      },
      null,
      2
    );
  }

  // Store SDK metadata
  generatedSDKs.set(sdkId, {
    id: sdkId,
    projectName,
    apiTitle: specObj.info?.title || 'Unknown API',
    languages,
    createdAt: new Date(),
    fileCount: Object.keys(files).length,
  });

  return { id: sdkId, files };
}

function generateTypeScriptSDK(specObj: any, projectName: string): string {
  const paths = specObj.paths || {};
  const endpoints = Object.entries(paths)
    .map(([path, methods]: [string, any]) => {
      const methodKeys = Object.keys(methods).filter((k) =>
        ['get', 'post', 'put', 'delete', 'patch'].includes(k)
      );
      return methodKeys
        .map((method) => {
          const methodUpper = method.toUpperCase();
          return `  async ${method}(path: string, data?: any) {
    return this.request('${methodUpper}', path, data);
  }`;
        })
        .join('\n');
    })
    .join('\n');

  return `import axios, { AxiosInstance } from 'axios';

export class ${projectName.charAt(0).toUpperCase() + projectName.slice(1).replace(/-/g, '')}Client {
  private client: AxiosInstance;

  constructor(baseURL: string = '${specObj.servers?.[0]?.url || 'http://api.example.com'}') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async request(method: string, path: string, data?: any) {
    try {
      const response = await this.client.request({
        method,
        url: path,
        data,
      });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

${endpoints || '  // Add your API methods here'}

  setToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = \`Bearer \${token}\`;
  }
}
`;
}

function generateTypeScriptTypes(specObj: any): string {
  const schemas = specObj.components?.schemas || specObj.definitions || {};
  const types = Object.entries(schemas)
    .map(([name, schema]: [string, any]) => {
      const properties = schema.properties || {};
      const fields = Object.entries(properties)
        .map(([propName, propSchema]: [string, any]) => {
          const required = (schema.required || []).includes(propName) ? '' : '?';
          const type = getTypeScriptType(propSchema);
          return `  ${propName}${required}: ${type};`;
        })
        .join('\n');

      return `export interface ${name} {\n${fields}\n}`;
    })
    .join('\n\n');

  return types || '// Add your type definitions here';
}

function getTypeScriptType(schema: any): string {
  if (schema.type === 'string') return 'string';
  if (schema.type === 'number' || schema.type === 'integer') return 'number';
  if (schema.type === 'boolean') return 'boolean';
  if (schema.type === 'array') return `${getTypeScriptType(schema.items || {})}[]`;
  if (schema.$ref) {
    const typeName = schema.$ref.split('/').pop();
    return typeName;
  }
  return 'any';
}

function generatePythonSDK(specObj: any, projectName: string): string {
  const moduleName = projectName.replace(/-/g, '_');
  const className = projectName
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

  return `import requests
from typing import Any, Dict, Optional

class ${className}Client:
    def __init__(self, base_url: str = "${specObj.servers?.[0]?.url || 'http://api.example.com'}"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})

    def _request(self, method: str, path: str, **kwargs) -> Dict[str, Any]:
        try:
            response = self.session.request(method, f"{self.base_url}{path}", **kwargs)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"API Error: {e}")
            raise

    def get(self, path: str, **kwargs) -> Dict[str, Any]:
        return self._request("GET", path, **kwargs)

    def post(self, path: str, data: Optional[Dict] = None, **kwargs) -> Dict[str, Any]:
        return self._request("POST", path, json=data, **kwargs)

    def set_token(self, token: str):
        self.session.headers.update({"Authorization": f"Bearer {token}"})
`;
}

function generateGoSDK(specObj: any, projectName: string): string {
  return `package ${projectName.replace('-', '')}

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

type Client struct {
	BaseURL string
	Client  *http.Client
}

func New(baseURL string) *Client {
	return &Client{
		BaseURL: baseURL,
		Client:  &http.Client{},
	}
}

func (c *Client) request(method, path string, body interface{}) (interface{}, error) {
	var bodyReader io.Reader
	if body != nil {
		data, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		bodyReader = bytes.NewReader(data)
	}

	req, err := http.NewRequest(method, c.BaseURL+path, bodyReader)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	return result, nil
}
`;
}

function generateJavaSDK(specObj: any, projectName: string): string {
  const className = projectName
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

  return `import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import com.google.gson.Gson;

public class ${className}Client {
    private String baseUrl;
    private HttpClient client;

    public ${className}Client(String baseUrl) {
        this.baseUrl = baseUrl;
        this.client = HttpClient.newHttpClient();
    }

    public String request(String method, String path, Object body) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
            .uri(new java.net.URI(baseUrl + path))
            .header("Content-Type", "application/json");

        if (body != null) {
            String json = new Gson().toJson(body);
            builder.method(method, HttpRequest.BodyPublishers.ofString(json));
        } else {
            builder.method(method, HttpRequest.BodyPublishers.noBody());
        }

        HttpResponse<String> response = client.send(
            builder.build(),
            HttpResponse.BodyHandlers.ofString()
        );
        return response.body();
    }
}
`;
}

function generateCSharpSDK(specObj: any, projectName: string): string {
  const className = projectName.replace(/-/g, '');
  return `using System;
using System.Net.Http;
using System.Threading.Tasks;

public class ${className}Client
{
    private string _baseUrl;
    private HttpClient _client;

    public ${className}Client(string baseUrl)
    {
        _baseUrl = baseUrl;
        _client = new HttpClient();
        _client.DefaultRequestHeaders.Add("Content-Type", "application/json");
    }

    public async Task<T> Request<T>(string method, string path, object body = null)
    {
        try
        {
            var request = new HttpRequestMessage(
                new HttpMethod(method),
                _baseUrl + path
            );

            if (body != null)
            {
                request.Content = new StringContent(
                    System.Text.Json.JsonSerializer.Serialize(body),
                    System.Text.Encoding.UTF8,
                    "application/json"
                );
            }

            var response = await _client.SendAsync(request);
            var responseContent = await response.Content.ReadAsStringAsync();
            return System.Text.Json.JsonSerializer.Deserialize<T>(responseContent);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"API Error: {ex.Message}");
            throw;
        }
    }
}
`;
}

function generateRustSDK(specObj: any, projectName: string): string {
  const structName = projectName.split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

  return `use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Clone)]
pub struct ${structName}Client {
    base_url: String,
    client: Client,
}

impl ${structName}Client {
    pub fn new(base_url: String) -> Self {
        Self {
            base_url,
            client: Client::new(),
        }
    }

    pub async fn request<T: Serialize, R: for<'de> Deserialize<'de>>(
        &self,
        method: &str,
        path: &str,
        body: Option<&T>,
    ) -> Result<R, Box<dyn std::error::Error>> {
        let url = format!("{}{}", self.base_url, path);
        let mut req = match method {
            "GET" => self.client.get(&url),
            "POST" => self.client.post(&url),
            "PUT" => self.client.put(&url),
            _ => self.client.post(&url),
        };

        if let Some(b) = body {
            req = req.json(b);
        }

        let response = req.send().await?;
        let data = response.json::<R>().await?;
        Ok(data)
    }
}
`;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { projectName, apiSpec, targetLanguages } = (await request.json()) as GenerateRequest;

    if (!projectName || !apiSpec || !targetLanguages || targetLanguages.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: projectName, apiSpec, targetLanguages' },
        { status: 400 }
      );
    }

    // Validate the specification
    const validation = validateSpecification(apiSpec);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid API specification', details: validation.errors },
        { status: 400 }
      );
    }

    // Check user credits (1 credit per SDK)
    const user = getUserById(auth.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const creditsNeeded = 1;
    if ((user.credits || 0) < creditsNeeded) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please upgrade your plan.' },
        { status: 402 }
      );
    }

    // Generate SDK
    const result = await generateSDKFromOpenAPI(apiSpec, projectName, targetLanguages);

    // Store SDK files for download
    storeSDK(result.id, result.files, projectName);

    // Deduct credits
    updateUserData(auth.user.id, {
      credits: user.credits - creditsNeeded,
    });

    // Track SDK generation
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/user/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sdk-generated',
          isWeb3: false,
        }),
      });
    } catch (e) {
      console.log('Stats tracking failed (non-critical):', e);
    }

    return NextResponse.json(
      {
        id: result.id,
        projectName,
        languages: targetLanguages,
        fileCount: Object.keys(result.files).length,
        downloadUrl: `/api/sdk/download?sdkId=${result.id}`,
        creditsRemaining: user.credits - creditsNeeded,
        message: 'SDK generated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('SDK generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate SDK' },
      { status: 500 }
    );
  }
}
