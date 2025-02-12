import { createDirectusEdgeWithDefaultUrl } from './directus-edge';
import { v4 as uuidv4 } from 'uuid';

export interface GitHubToken {
  id?: string;
  user_id: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  token_type?: string;
  scope?: string;
}

export async function saveGitHubToken(userId: string, tokenData: Omit<GitHubToken, 'id' | 'user_id'>) {
  const directus = createDirectusEdgeWithDefaultUrl();
  
  // Check if token already exists for user
  const existingToken = await directus.request<GitHubToken[]>('get', '/items/github_tokens', {
    params: {
      filter: {
        user_id: {
          _eq: userId
        }
      }
    }
  });

  const token: GitHubToken = {
    ...tokenData,
    user_id: userId,
  };

  if (existingToken?.length > 0) {
    // Update existing token
    return await directus.request('patch', `/items/github_tokens/${existingToken[0].id}`, {
      data: token
    });
  } else {
    // Create new token
    return await directus.request('post', '/items/github_tokens', {
      data: {
        ...token,
        id: uuidv4()
      }
    });
  }
}

export async function getGitHubToken(userId: string): Promise<GitHubToken | null> {
  const directus = createDirectusEdgeWithDefaultUrl();
  
  const tokens = await directus.request<GitHubToken[]>('get', '/items/github_tokens', {
    params: {
      filter: {
        user_id: {
          _eq: userId
        }
      }
    }
  });

  return tokens?.[0] || null;
}

export async function deleteGitHubToken(userId: string): Promise<void> {
  const directus = createDirectusEdgeWithDefaultUrl();
  const token = await getGitHubToken(userId);
  
  if (token?.id) {
    await directus.request('delete', `/items/github_tokens/${token.id}`);
  }
}