import { NextResponse } from 'next/server';

interface GraphQLRepoNode {
  id: string;
  name: string;
  nameWithOwner: string;
  url: string;
  isPrivate: boolean;
  owner: {
    login: string;
  };
  defaultBranchRef?: {
    name: string;
  } | null;
}

interface RESTRepoNode {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  private: boolean;
  owner: {
    login: string;
  };
  default_branch: string;
}

interface GraphQLPinnedResponse {
  data?: {
    user?: {
      pinnedItems?: {
        nodes?: GraphQLRepoNode[];
      };
    };
  };
  errors?: Array<{ message: string }>;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const type = searchParams.get('type'); // 'pinned' or 'all'

  if (!username) {
    return NextResponse.json(
      { error: 'Username query parameter is required' },
      { status: 400 },
    );
  }

  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: 'GITHUB_TOKEN is not configured in server environment' },
      { status: 500 },
    );
  }

  try {
    // 1. Pinned Repos (GraphQL API with Authorization Header)
    if (type === 'pinned') {
      const res = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'BuildPulse-App',
        },
        body: JSON.stringify({
          query: `
            query ($username: String!) {
              user(login: $username) {
                pinnedItems(first: 6, types: REPOSITORY) {
                  nodes {
                    ... on Repository {
                      id
                      name
                      nameWithOwner
                      url
                      isPrivate
                      owner {
                        login
                      }
                      defaultBranchRef {
                        name
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: { username },
        }),
        cache: 'no-store',
      });

      if (!res.ok)
        throw new Error(
          `GitHub GraphQL API responded with status ${res.status}`,
        );
      const data: GraphQLPinnedResponse = await res.json();
      if (data.errors)
        return NextResponse.json(
          { error: data.errors[0].message },
          { status: 400 },
        );

      // Map GraphQL nodes to match REST repository property shape so client mapper handles them identically
      const rawNodes = data.data?.user?.pinnedItems?.nodes ?? [];
      const formattedPinnedRepos = rawNodes.map((repo: GraphQLRepoNode) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.nameWithOwner,
        url: repo.url,
        isPrivate: repo.isPrivate,
        owner: repo.owner.login,
        defaultBranch: repo.defaultBranchRef?.name || 'main',
      }));

      return NextResponse.json({ repos: formattedPinnedRepos });
    }

    // 2. All Public Repos (REST API with Authorization Header)
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?type=public&sort=updated&per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'BuildPulse-App',
        },
        cache: 'no-store',
      },
    );

    if (!res.ok)
      throw new Error(`GitHub REST API responded with status ${res.status}`);

    const rawRepos: RESTRepoNode[] = await res.json();

    const formattedRepos = rawRepos.map((repo: RESTRepoNode) => ({
      id: String(repo.id),
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      isPrivate: repo.private,
      owner: repo.owner.login, // 👈 Extract .login here so REST repos also output a primitive string!
      defaultBranch: repo.default_branch || 'main',
    }));

    return NextResponse.json({ repos: formattedRepos });
  } catch (error) {
    console.error('Failed to fetch respositories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 },
    );
  }
}
