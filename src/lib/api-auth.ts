import { NextRequest } from "next/server";
import { getUserByApiKey, type User } from "./db";

export interface ApiAuthResult {
    authenticated: boolean;
    user?: User;
    error?: string;
}

//simple api key verification 
export async function verifyApiKey(apiKey: string): Promise<ApiAuthResult> {
    const user = await getUserByApiKey(apiKey);

    if(!user) {
        return {
            authenticated: false,
            error: 'Invalid API key.',
        }
    }
    return {
        authenticated: true,
        user,
    };
}

// verify api key from request
export async function verifyApiAuth(request: NextRequest): Promise<ApiAuthResult> {
    // get the api key from the header or query parameter
    const apiKey = request.headers.get('X-API_Key') ||
                    new URL(request.url).searchParams.get('api_key');
    
    if(!apiKey) {
        return {
            authenticated: false,
            error: 'API key is required. Provide X-API-Key or api_key query parameter.',
        };
    }
    return await verifyApiKey(apiKey);
}


