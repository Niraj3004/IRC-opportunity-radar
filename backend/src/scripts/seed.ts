import mongoose from 'mongoose';
import User from '../models/User';
import Source from '../models/Source';
import Opportunity from '../models/Opportunity';
import dotenv from 'dotenv';
import { hashString } from '../utils/hash';
import { connectDB } from '../config/db.config';

dotenv.config();

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // 1. Clear existing seed data (idempotency)
  await User.deleteMany({ email: { $in: ['superadmin@test.com', 'member1@test.com', 'member2@test.com'] } });
  await Source.deleteMany({ name: { $in: ['ReliefWeb RSS', 'DevEx RSS'] } });
  await Opportunity.deleteMany({ title: { $regex: /Seed/i } });

  // 2. Insert Users
  const passwordHash = await hashString('password123');
  
  const superAdmin = await User.create({
    name: 'Super Admin',
    email: 'superadmin@test.com',
    passwordHash,
    role: 'super_admin',
    status: 'active'
  });

  await User.create([
    { name: 'Alice Member', email: 'member1@test.com', passwordHash, role: 'member', status: 'active', interests: ['Grant'] },
    { name: 'Bob Member', email: 'member2@test.com', passwordHash, role: 'member', status: 'active', interests: ['Job'] }
  ]);
  console.log('✅ Users seeded');

  // 3. Insert Sources (Real RSS Feeds)
  const source1 = await Source.create({
    name: 'ReliefWeb RSS',
    url: 'https://reliefweb.int/jobs/rss.xml',
    type: 'rss',
    category: 'Jobs',
    tags: ['ngo', 'international'],
    fetchFrequency: '0 0 * * *',
    enabled: true,
    createdBy: superAdmin._id
  } as any);

  const source2 = await Source.create({
    name: 'DevEx RSS',
    url: 'https://www.devex.com/jobs.rss', // placeholder
    type: 'rss',
    category: 'Jobs',
    tags: ['development'],
    fetchFrequency: '0 0 * * *',
    enabled: true,
    createdBy: superAdmin._id
  } as any);
  console.log('✅ Sources seeded');

  // 4. Insert Opportunities
  await Opportunity.insertMany([
    {
      title: 'Seed: ReliefWeb Fellowship',
      type: 'fellowship',
      url: 'https://example.com/1',
      sourceId: source1._id,
      confidence: 0.95,
      status: 'published',
      dedupeKey: 'seed_rw_fellowship'
    },
    {
      title: 'Seed: DevEx Grant 2026',
      type: 'grant',
      url: 'https://example.com/2',
      sourceId: source2._id,
      confidence: 0.4,
      status: 'pending',
      dedupeKey: 'seed_dx_grant'
    }
  ]);
  console.log('✅ Opportunities seeded');

  console.log('🎉 Seeding complete!');
  process.exit(0);
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
