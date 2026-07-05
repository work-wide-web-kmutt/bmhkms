export type SeedRole =
  | "admin"
  | "contestant"
  | "observer"
  | "records_staff"
  | "root"
  | "staff";

export interface SeedUser {
  displayUsername: string;
  email: string;
  name: string;
  password: string;
  role: SeedRole;
  username: string;
}

interface AuthAccount {
  providerId: string;
}

interface AuthUserLookup {
  user?: {
    id: string;
  };
}

interface AuthContext {
  internalAdapter: {
    findAccounts: (userId: string) => Promise<AuthAccount[]>;
    findUserByEmail: (email: string) => Promise<AuthUserLookup | null>;
    linkAccount: (input: {
      accountId: string;
      password: string;
      providerId: string;
      userId: string;
    }) => Promise<unknown>;
    updatePassword: (userId: string, password: string) => Promise<unknown>;
    updateUser: (
      userId: string,
      data: {
        banExpires: null;
        banReason: null;
        banned: false;
        displayUsername: string;
        emailVerified: true;
        name: string;
        role: SeedRole;
        username: string;
      }
    ) => Promise<unknown>;
  };
  password: {
    hash: (password: string) => Promise<string>;
  };
}

interface AuthModule {
  auth: {
    api: {
      createUser: (input: {
        body: {
          data: {
            displayUsername: string;
            emailVerified: true;
            username: string;
          };
          email: string;
          name: string;
          password: string;
          role: SeedRole;
        };
      }) => Promise<unknown>;
    };
    $context: Promise<AuthContext>;
  };
}

interface ReconcileResult {
  email: string;
  role: SeedRole;
  status: "created" | "updated";
}

const AUTH_MODULE_PATH = "../../../auth/src/index";
const CREDENTIAL_PROVIDER_ID = "credential";

function getAuthModule(): Promise<AuthModule> {
  return import(AUTH_MODULE_PATH) as Promise<AuthModule>;
}

async function reconcileExistingUser(
  seedUser: SeedUser,
  userId: string
): Promise<void> {
  const { auth } = await getAuthModule();
  const context = await auth.$context;
  const hashedPassword = await context.password.hash(seedUser.password);

  await context.internalAdapter.updateUser(userId, {
    banExpires: null,
    banReason: null,
    banned: false,
    displayUsername: seedUser.displayUsername,
    emailVerified: true,
    name: seedUser.name,
    role: seedUser.role,
    username: seedUser.username,
  });

  const accounts = await context.internalAdapter.findAccounts(userId);
  const credentialAccount = accounts.find(
    (account) => account.providerId === CREDENTIAL_PROVIDER_ID
  );

  if (credentialAccount) {
    await context.internalAdapter.updatePassword(userId, hashedPassword);
    return;
  }

  await context.internalAdapter.linkAccount({
    accountId: userId,
    password: hashedPassword,
    providerId: CREDENTIAL_PROVIDER_ID,
    userId,
  });
}

export async function reconcileSeedUser(
  seedUser: SeedUser
): Promise<ReconcileResult> {
  const { auth } = await getAuthModule();
  const context = await auth.$context;
  const email = seedUser.email.toLowerCase();
  const existingUser = await context.internalAdapter.findUserByEmail(email);

  if (!existingUser?.user) {
    await auth.api.createUser({
      body: {
        data: {
          displayUsername: seedUser.displayUsername,
          emailVerified: true,
          username: seedUser.username,
        },
        email,
        name: seedUser.name,
        password: seedUser.password,
        role: seedUser.role,
      },
    });

    const createdUser = await context.internalAdapter.findUserByEmail(email);

    if (!createdUser?.user) {
      throw new Error(`Failed to create seeded user: ${email}`);
    }

    await reconcileExistingUser(seedUser, createdUser.user.id);

    return {
      email,
      role: seedUser.role,
      status: "created",
    };
  }

  await reconcileExistingUser(seedUser, existingUser.user.id);

  return {
    email,
    role: seedUser.role,
    status: "updated",
  };
}
