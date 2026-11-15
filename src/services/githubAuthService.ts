import { ManagementClient } from 'auth0';
import { PrismaClient } from '../../generated/prisma/client.ts';

const prisma = new PrismaClient();

// Initialize Management API client
const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_MGMT_CLIENT_ID!,
  clientSecret: process.env.AUTH0_MGMT_CLIENT_SECRET!,
});

// Receives the Auth0 user profile and returns the user record from the DB
export async function handleGithubLogin(auth0User: any) {
  const email = auth0User.email;
  const auth0Sub = auth0User.sub;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    const primaryUserId = existingUser.auth0Id;
    const secondaryProvider = 'github';
    const secondaryUserId = auth0Sub.split('|')[1];

    try {
      // Link the GitHub identity to the existing primary account
      await management.users.identities.link(primaryUserId, {
        provider: secondaryProvider,
        user_id: secondaryUserId,
      });
      
      return existingUser;
      
    } catch (error) {
      // This is a placeholder. We could later decide a specific error handling strategy.
      console.error("Error linking accounts:", error);
      throw new Error('Failed to link GitHub account to existing user');
    }
  } else {
    const newUser = await prisma.user.create({
      data: {
        email: email,
        name: auth0User.name,
        avatar: auth0User.picture,
        auth0Id: auth0Sub, // Store the Auth0 sub for future linking
      },
    });
    
    return newUser;
  }
}