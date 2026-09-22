import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import { hashPassword } from "../src/lib/password.js";

const DEMO_EMAIL = "demo@docuchat.dev";
const DEMO_PASSWORD = "DemoPass1!";

async function main() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      name: "Demo User",
      passwordHash,
      isActive: true,
    },
    create: {
      name: "Demo User",
      email: DEMO_EMAIL,
      passwordHash,
      role: "USER",
      tier: "FREE",
    },
  });

  const existingDoc = await prisma.document.findFirst({
    where: { userId: user.id },
  });
  if (!existingDoc) {
    await prisma.document.create({
      data: {
        userId: user.id,
        status: "pending",
      },
    });
  }

  await seedRBAC();

  const adminRole = await prisma.role.findUnique({ where: { name: "admin" } });
  if (adminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: user.id, roleId: adminRole.id },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: adminRole.id,
      },
    });
  }

  console.log("Seed complete");
  console.log(`  email:    ${DEMO_EMAIL}`);
  console.log(`  password: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  async function seedRBAC() {
    // Define permissions
    const permissionDefs = [
      { name: 'documents:create', resource: 'documents', action: 'create',
        description: 'Upload documents' },
      { name: 'documents:read', resource: 'documents', action: 'read',
        description: 'View documents' },
      { name: 'documents:update', resource: 'documents', action: 'update',
        description: 'Edit document metadata' },
      { name: 'documents:delete', resource: 'documents', action: 'delete',
        description: 'Delete documents' },
      { name: 'conversations:create', resource: 'conversations', action: 'create',
        description: 'Start conversations' },
      { name: 'conversations:read', resource: 'conversations', action: 'read',
        description: 'View conversations' },
      { name: 'users:read', resource: 'users', action: 'read',
        description: 'View user list' },
      { name: 'users:manage', resource: 'users', action: 'manage',
        description: 'Manage user accounts' },
      { name: 'roles:manage', resource: 'roles', action: 'manage',
        description: 'Manage roles and permissions' },
    ];
  
    // Upsert all permissions
    const permissions: Record<string, any> = {};
    for (const perm of permissionDefs) {
      permissions[perm.name] = await prisma.permission.upsert({
        where: { name: perm.name },
        update: {},
        create: perm,
      });
    }
  
    // Define roles with their permissions
    const roleDefs = [
      {
        name: 'admin',
        description: 'Full system access',
        permissions: Object.keys(permissions), // All permissions
      },
      {
        name: 'member',
        description: 'Standard user',
        isDefault: true,
        permissions: [
          'documents:create', 'documents:read', 'documents:update',
          'conversations:create', 'conversations:read',
        ],
      },
      {
        name: 'viewer',
        description: 'Read-only access',
        permissions: ['documents:read', 'conversations:read'],
      },
    ];
  
    for (const roleDef of roleDefs) {
      const role = await prisma.role.upsert({
        where: { name: roleDef.name },
        update: {},
        create: {
          name: roleDef.name,
          description: roleDef.description,
          isDefault: roleDef.isDefault ?? false,
        },
      });
  
      // Link permissions to role
      for (const permName of roleDef.permissions) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permissions[permName].id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permissions[permName].id,
          },
        });
      }
    }
  
    console.log('RBAC seeded: 3 roles, 9 permissions');
  }
  