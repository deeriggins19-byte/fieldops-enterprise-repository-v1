const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main(){
  const ownerEmail = process.env.SEED_OWNER_EMAIL || 'admin@fieldops.local';
  const ownerPassword = process.env.SEED_OWNER_PASSWORD || 'FieldOps2026!';
  const passwordHash = await bcrypt.hash(ownerPassword, 12);

  let tenant = await prisma.tenant.findFirst({
    where: { name: 'FieldOps Pilot Company' },
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'FieldOps Pilot Company',
      },
    });
  }

  let owner = await prisma.user.findUnique({ where: { email: ownerEmail } });
  const tenantId = tenant.id;

  if (!owner) {
    owner = await prisma.user.findFirst({
      where: {
        tenantId,
        role: 'OWNER',
      },
    });

    if (owner) {
      owner = await prisma.user.update({
        where: { id: owner.id },
        data: {
          tenantId,
          email: ownerEmail,
          fullName: 'Pilot Owner',
          passwordHash,
          role: 'OWNER',
        },
      });
    } else {
      owner = await prisma.user.create({
        data: {
          tenantId,
          email: ownerEmail,
          fullName: 'Pilot Owner',
          passwordHash,
          role: 'OWNER',
        },
      });
    }
  } else {

    await prisma.user.update({
      where: { id: owner.id },
      data: {
        tenantId,
        email: ownerEmail,
        fullName: 'Pilot Owner',
        passwordHash,
        role: 'OWNER',
      },
    });
  }

  let project = await prisma.project.findFirst({
    where: {
      tenantId,
      name: 'Pilot Project',
    },
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        tenantId,
        name: 'Pilot Project',
        customerName: 'Demo Customer',
        estimatedHours: 120,
      },
    });
  }

  await prisma.asset.upsert({
    where: { tenantId_code: { tenantId, code: 'PNL-001' } },
    update: {
      projectId: project.id,
      name: 'Panelboard 001',
      category: 'Electrical',
    },
    create: {
      tenantId,
      projectId: project.id,
      code: 'PNL-001',
      name: 'Panelboard 001',
      category: 'Electrical',
    },
  });

  await prisma.asset.upsert({
    where: { tenantId_code: { tenantId, code: 'XFMR-001' } },
    update: {
      projectId: project.id,
      name: 'Transformer 001',
      category: 'Electrical',
    },
    create: {
      tenantId,
      projectId: project.id,
      code: 'XFMR-001',
      name: 'Transformer 001',
      category: 'Electrical',
    },
  });

  console.log(`Seed complete. Login ${ownerEmail} / ${ownerPassword}`);
}

main().finally(()=>prisma.$disconnect());
