import bcrypt from 'bcryptjs';
import { db, initDatabase } from './db.ts';

export function seedDatabase(force: boolean = false) {
  initDatabase();

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0 && !force) {
    console.log('Database already contains data. Skipping initial seeding.');
    return;
  }

  if (force) {
    console.log('Clearing existing records for Amloda Village re-seed...');
    db.exec(`
      DELETE FROM audit_logs;
      DELETE FROM notifications;
      DELETE FROM announcements;
      DELETE FROM expenses;
      DELETE FROM budgets;
      DELETE FROM event_participants;
      DELETE FROM events;
      DELETE FROM survey_answers;
      DELETE FROM survey_responses;
      DELETE FROM survey_questions;
      DELETE FROM surveys;
      DELETE FROM tasks;
      DELETE FROM campaign_members;
      DELETE FROM campaigns;
      DELETE FROM users;
      DELETE FROM organizational_units;
      DELETE FROM roles;
    `);
  }

  console.log('Seeding Amloda Village (अमलोदा ग्राम पंचायत) platform data into SQLite database...');

  const defaultPasswordHash = bcrypt.hashSync('politix2026', 10);

  // 1. ROLES
  const insertRole = db.prepare(`
    INSERT INTO roles (id, name, description, permissions)
    VALUES (?, ?, ?, ?)
  `);

  const roles = [
    {
      id: 'role-superadmin',
      name: 'Super Administrator',
      description: 'Sarpanch (ग्राम प्रधान / सरपंच) with full executive authority over Amloda Gram Panchayat, development funds, and council decisions.',
      permissions: JSON.stringify(['all', 'admin', 'manage_users', 'manage_units', 'manage_campaigns', 'manage_finances', 'manage_surveys', 'approve_expenses', 'export_reports'])
    },
    {
      id: 'role-centraladmin',
      name: 'Central Administrator',
      description: 'Up-Sarpanch & Panchayat Executive Secretary handling village registers, funds allocation, and inter-ward coordination.',
      permissions: JSON.stringify(['admin', 'manage_users', 'manage_units', 'manage_campaigns', 'manage_finances', 'manage_surveys', 'approve_expenses', 'export_reports'])
    },
    {
      id: 'role-statecoord',
      name: 'State Coordinator',
      description: 'Block Development Officer (BDO) & Rural Liaison coordinating government welfare schemes with Amloda village.',
      permissions: JSON.stringify(['view_state', 'manage_districts', 'manage_campaigns', 'manage_events', 'submit_expenses', 'view_reports'])
    },
    {
      id: 'role-districtcoord',
      name: 'District Coordinator',
      description: 'Primary Health & Sanitation Director overseeing Amloda sub-center clinics, hygiene, and public works.',
      permissions: JSON.stringify(['view_district', 'manage_constituencies', 'manage_events', 'assign_tasks', 'submit_expenses'])
    },
    {
      id: 'role-constituencymgr',
      name: 'Constituency Manager',
      description: 'Ward Representative (वार्ड पंच) leading citizen consultations, door-to-door village surveys, and local chaupal meetings.',
      permissions: JSON.stringify(['view_constituency', 'manage_local_teams', 'manage_surveys', 'assign_tasks'])
    },
    {
      id: 'role-campaignmgr',
      name: 'Campaign Manager',
      description: 'Village Development & Infrastructure Project Director managing RO water plant, solar lighting, and road projects.',
      permissions: JSON.stringify(['manage_campaigns', 'manage_tasks', 'manage_events', 'submit_expenses', 'view_reports'])
    },
    {
      id: 'role-volunteer',
      name: 'Volunteer / Ground Worker',
      description: 'Gram Vikas Sevak (ग्राम विकास स्वयंसेवक) and youth worker executing field surveys, health camps, and event arrangements.',
      permissions: JSON.stringify(['view_assigned_tasks', 'attend_events', 'distribute_surveys'])
    }
  ];

  for (const r of roles) {
    insertRole.run(r.id, r.name, r.description, r.permissions);
  }

  // 2. ORGANIZATIONAL UNITS (Amloda Village Structure)
  const insertUnit = db.prepare(`
    INSERT INTO organizational_units (id, name, type, parent_id, coordinator_id, state_name, district_name, address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const units = [
    { id: 'unit-amloda-panchayat', name: 'Gram Panchayat Amloda Central Secretariat', type: 'Central', parent_id: null, coordinator_id: 'user-superadmin', state_name: 'Northern Rural Region', district_name: 'Amloda Block', address: 'Panchayat Bhavan, Main Chaupal, Amloda Village' },
    
    // Major Village Sectors
    { id: 'unit-ward-north', name: 'Amloda Ward 1–4 Directorate (North & School Zone)', type: 'State', parent_id: 'unit-amloda-panchayat', coordinator_id: 'user-statecoord-1', state_name: 'Northern Rural Region', district_name: 'Amloda North', address: 'Near Govt Senior Secondary School, Ward 2, Amloda' },
    { id: 'unit-ward-central', name: 'Amloda Ward 5–8 Directorate (Market & Chaupal Zone)', type: 'State', parent_id: 'unit-amloda-panchayat', coordinator_id: 'user-centraladmin', state_name: 'Northern Rural Region', district_name: 'Amloda Central', address: 'Old Banyan Tree Chowk, Ward 6, Amloda' },
    { id: 'unit-ward-south', name: 'Amloda Ward 9–12 Directorate (Farmlands & Canal Zone)', type: 'State', parent_id: 'unit-amloda-panchayat', coordinator_id: 'user-districtcoord-1', state_name: 'Northern Rural Region', district_name: 'Amloda South', address: 'Irrigation Canal Road, Ward 11, Amloda' },

    // Functional Village Committees
    { id: 'unit-comm-water', name: 'Amloda Water Management & RO Facility Committee', type: 'District', parent_id: 'unit-ward-central', coordinator_id: 'user-campaignmgr-1', state_name: 'Northern Rural Region', district_name: 'Amloda Central', address: 'Water Filtration Facility, Ward 7, Amloda' },
    { id: 'unit-comm-kisan', name: 'Amloda Farmers Welfare & Agricultural Mandi Unit', type: 'District', parent_id: 'unit-ward-south', coordinator_id: null, state_name: 'Northern Rural Region', district_name: 'Amloda South', address: 'Kisan Seva Kendra, Canal Road, Amloda' },
    { id: 'unit-comm-health', name: 'Amloda Primary Health & Sanitation Command', type: 'District', parent_id: 'unit-ward-north', coordinator_id: 'user-districtcoord-1', state_name: 'Northern Rural Region', district_name: 'Amloda North', address: 'Ayushman Arogya Mandir Sub-Center, Ward 3, Amloda' },
    { id: 'unit-comm-youth', name: 'Amloda Youth Sports & Skill Development Club', type: 'Constituency', parent_id: 'unit-ward-north', coordinator_id: null, state_name: 'Northern Rural Region', district_name: 'Amloda North', address: 'Village Playground, Near Stadium Ground, Amloda' },
    { id: 'unit-comm-mahila', name: 'Amloda Mahila Self-Help & Handicrafts Mandal', type: 'Constituency', parent_id: 'unit-ward-central', coordinator_id: 'user-constituency-1', state_name: 'Northern Rural Region', district_name: 'Amloda Central', address: 'Community Center Hall, Ward 5, Amloda' },
    { id: 'unit-comm-sanitation', name: 'Amloda Swachhata & Village Cleanliness Team', type: 'Local', parent_id: 'unit-ward-central', coordinator_id: 'user-volunteer-1', state_name: 'Northern Rural Region', district_name: 'Amloda Central', address: 'Panchayat Waste Sorting Yard, Ward 6, Amloda' }
  ];

  for (const u of units) {
    insertUnit.run(u.id, u.name, u.type, u.parent_id, u.coordinator_id, u.state_name, u.district_name, u.address);
  }

  // 3. USERS (30 Amloda Village Council, Ward Leaders & Volunteers)
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, role, phone, unit_id, status, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const users = [
    // 7 Core Amloda Demo Accounts
    { id: 'user-superadmin', email: 'superadmin@politix.org', full_name: 'Rameshwar Prasad Sharma', role: 'Super Administrator', phone: '+91 98290 12001', unit_id: 'unit-amloda-panchayat', status: 'Active' },
    { id: 'user-centraladmin', email: 'centraladmin@politix.org', full_name: 'Sunita Devi Gurjar', role: 'Central Administrator', phone: '+91 98290 12002', unit_id: 'unit-amloda-panchayat', status: 'Active' },
    { id: 'user-statecoord-1', email: 'statecoord@politix.org', full_name: 'Rajesh Meena', role: 'State Coordinator', phone: '+91 98290 12003', unit_id: 'unit-ward-north', status: 'Active' },
    { id: 'user-districtcoord-1', email: 'districtcoord@politix.org', full_name: 'Dr. Mahendra Choudhary', role: 'District Coordinator', phone: '+91 98290 12004', unit_id: 'unit-comm-health', status: 'Active' },
    { id: 'user-constituency-1', email: 'constituency@politix.org', full_name: 'Rekha Bai', role: 'Constituency Manager', phone: '+91 98290 12005', unit_id: 'unit-comm-mahila', status: 'Active' },
    { id: 'user-campaignmgr-1', email: 'campaignmgr@politix.org', full_name: 'Vikram Singh Shekhawat', role: 'Campaign Manager', phone: '+91 98290 12006', unit_id: 'unit-comm-water', status: 'Active' },
    { id: 'user-volunteer-1', email: 'volunteer@politix.org', full_name: 'Pooja Saini', role: 'Volunteer / Ground Worker', phone: '+91 98290 12007', unit_id: 'unit-comm-sanitation', status: 'Active' },

    // Additional Amloda Ward Leaders & Council Members
    { id: 'user-ward-1', email: 'ward1@amloda.org', full_name: 'Gopal Lal Kumawat', role: 'Constituency Manager', phone: '+91 98290 12008', unit_id: 'unit-ward-north', status: 'Active' },
    { id: 'user-ward-2', email: 'ward2@amloda.org', full_name: 'Bhanwar Singh Rajput', role: 'Campaign Manager', phone: '+91 98290 12009', unit_id: 'unit-ward-south', status: 'Active' },
    { id: 'user-ward-3', email: 'ward4@amloda.org', full_name: 'Kailash Chand Verma', role: 'District Coordinator', phone: '+91 98290 12010', unit_id: 'unit-comm-kisan', status: 'Active' },
    { id: 'user-ward-4', email: 'youth.lead@amloda.org', full_name: 'Amit Sharma', role: 'Campaign Manager', phone: '+91 98290 12011', unit_id: 'unit-comm-youth', status: 'Active' },
    { id: 'user-ward-5', email: 'education.officer@amloda.org', full_name: 'Meenakshi Rathore', role: 'State Coordinator', phone: '+91 98290 12012', unit_id: 'unit-ward-north', status: 'Active' },

    // 18 Dedicated Amloda Field Sevaks & Volunteers
    { id: 'user-vol-2', email: 'vol.deepak@amloda.org', full_name: 'Deepak Gurjar', role: 'Volunteer / Ground Worker', phone: '+91 98290 12013', unit_id: 'unit-comm-water', status: 'Active' },
    { id: 'user-vol-3', email: 'vol.anita@amloda.org', full_name: 'Anita Bano', role: 'Volunteer / Ground Worker', phone: '+91 98290 12014', unit_id: 'unit-comm-mahila', status: 'Active' },
    { id: 'user-vol-4', email: 'vol.suresh@amloda.org', full_name: 'Suresh Chandra Jat', role: 'Volunteer / Ground Worker', phone: '+91 98290 12015', unit_id: 'unit-comm-kisan', status: 'Active' },
    { id: 'user-vol-5', email: 'vol.manoj@amloda.org', full_name: 'Manoj Kumar Saini', role: 'Volunteer / Ground Worker', phone: '+91 98290 12016', unit_id: 'unit-ward-central', status: 'Active' },
    { id: 'user-vol-6', email: 'vol.kavita@amloda.org', full_name: 'Kavita Joshi', role: 'Volunteer / Ground Worker', phone: '+91 98290 12017', unit_id: 'unit-comm-health', status: 'Active' },
    { id: 'user-vol-7', email: 'vol.rahul@amloda.org', full_name: 'Rahul Meena', role: 'Volunteer / Ground Worker', phone: '+91 98290 12018', unit_id: 'unit-comm-youth', status: 'Active' },
    { id: 'user-vol-8', email: 'vol.sita@amloda.org', full_name: 'Sita Devi Kumhar', role: 'Volunteer / Ground Worker', phone: '+91 98290 12019', unit_id: 'unit-comm-mahila', status: 'Active' },
    { id: 'user-vol-9', email: 'vol.dinesh@amloda.org', full_name: 'Dinesh Yadav', role: 'Volunteer / Ground Worker', phone: '+91 98290 12020', unit_id: 'unit-comm-water', status: 'Active' },
    { id: 'user-vol-10', email: 'vol.radha@amloda.org', full_name: 'Radha Bai Gurjar', role: 'Volunteer / Ground Worker', phone: '+91 98290 12021', unit_id: 'unit-comm-sanitation', status: 'Active' },
    { id: 'user-vol-11', email: 'vol.mukesh@amloda.org', full_name: 'Mukesh Sharma', role: 'Volunteer / Ground Worker', phone: '+91 98290 12022', unit_id: 'unit-comm-kisan', status: 'Active' },
    { id: 'user-vol-12', email: 'vol.priyanka@amloda.org', full_name: 'Priyanka Rathore', role: 'Volunteer / Ground Worker', phone: '+91 98290 12023', unit_id: 'unit-ward-north', status: 'Active' },
    { id: 'user-vol-13', email: 'vol.tarun@amloda.org', full_name: 'Tarun Shekhawat', role: 'Volunteer / Ground Worker', phone: '+91 98290 12024', unit_id: 'unit-comm-youth', status: 'Active' },
    { id: 'user-vol-14', email: 'vol.laxmi@amloda.org', full_name: 'Laxmi Devi Prajapat', role: 'Volunteer / Ground Worker', phone: '+91 98290 12025', unit_id: 'unit-comm-mahila', status: 'Active' },
    { id: 'user-vol-15', email: 'vol.ashok@amloda.org', full_name: 'Ashok Kumar Meena', role: 'Volunteer / Ground Worker', phone: '+91 98290 12026', unit_id: 'unit-ward-south', status: 'Active' },
    { id: 'user-vol-16', email: 'vol.saroj@amloda.org', full_name: 'Saroj Devi', role: 'Volunteer / Ground Worker', phone: '+91 98290 12027', unit_id: 'unit-comm-health', status: 'Active' },
    { id: 'user-vol-17', email: 'vol.pankaj@amloda.org', full_name: 'Pankaj Kumawat', role: 'Volunteer / Ground Worker', phone: '+91 98290 12028', unit_id: 'unit-comm-water', status: 'Active' },
    { id: 'user-vol-18', email: 'vol.geeta@amloda.org', full_name: 'Geeta Sharma', role: 'Volunteer / Ground Worker', phone: '+91 98290 12029', unit_id: 'unit-comm-sanitation', status: 'Active' },
    { id: 'user-vol-19', email: 'vol.ramesh@amloda.org', full_name: 'Rameshwar Lal Jat', role: 'Volunteer / Ground Worker', phone: '+91 98290 12030', unit_id: 'unit-ward-south', status: 'Inactive' }
  ];

  for (const u of users) {
    insertUser.run(u.id, u.email, defaultPasswordHash, u.full_name, u.role, u.phone, u.unit_id, u.status, null);
  }

  // 4. CAMPAIGNS (5 Focused Amloda Village Development Projects)
  const insertCampaign = db.prepare(`
    INSERT INTO campaigns (id, title, description, objectives, start_date, end_date, location, status, manager_id, budget_allocated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const campaigns = [
    {
      id: 'camp-1',
      title: 'Amloda Clean Drinking Water & Community RO Plant Drive',
      description: 'Installing a high-capacity 5,000 LPH community RO water filtration plant, laying underground pipeline extensions to Wards 8, 9 & 10, and modernizing village canal reservoir inlet.',
      objectives: '1. Connect 820 Amloda households to clean pressurized drinking water.\n2. Complete 2.4 km distribution pipeline along Canal Road.\n3. Eliminate fluoride contamination in Ward 8 tubewells.',
      start_date: '2026-02-01',
      end_date: '2026-06-30',
      location: 'Amloda Village - Central RO Plant & Wards 7-10',
      status: 'Active',
      manager_id: 'user-campaignmgr-1',
      budget_allocated: 480000.00
    },
    {
      id: 'camp-2',
      title: 'Panchayat Solar Street Lighting & Clean Energy Project',
      description: 'Erecting 120 standalone solar LED street light poles across all 12 village wards, main chaupals, village school roads, and night bus waiting stops.',
      objectives: '1. Install 120 solar LED poles with 3-day battery backup.\n2. Light up 6 unlit intersections and women safety corridors.\n3. Zero village electricity bills for public street illumination.',
      start_date: '2026-01-15',
      end_date: '2026-05-30',
      location: 'All 12 Wards of Amloda Village',
      status: 'Active',
      manager_id: 'user-ward-2',
      budget_allocated: 320000.00
    },
    {
      id: 'camp-3',
      title: 'Gram Vikas: Internal CC Roads & Covered Drainage Upgrade',
      description: 'Paving 3.2 km of durable concrete (CC) internal village roadways and installing pre-cast covered drainage canals to prevent monsoon waterlogging around Amloda Chaupal.',
      objectives: '1. Construct all-weather concrete road from Main Bus Stand to School.\n2. Replace open sewage trenches with covered concrete drains.\n3. Ensure smooth tractor and ambulance movement throughout village.',
      start_date: '2026-03-01',
      end_date: '2026-08-31',
      location: 'Amloda Wards 1, 3, 5, 6 & Main Market',
      status: 'Planned',
      manager_id: 'user-campaignmgr-1',
      budget_allocated: 650000.00
    },
    {
      id: 'camp-4',
      title: 'Amloda Senior Secondary School Digital Lab & Girls Library',
      description: 'Building a modern 25-computer digital education center, high-speed broadband connection, and dedicated competitive exam study library for village youth and girls.',
      objectives: '1. Procure 25 desktop workstations with offline educational software.\n2. Establish dedicated quiet reading room with 1,200 books.\n3. Provide daily free digital literacy coaching for 180 village students.',
      start_date: '2026-01-10',
      end_date: '2026-04-30',
      location: 'Govt Senior Secondary School, Ward 2, Amloda',
      status: 'Active',
      manager_id: 'user-ward-4',
      budget_allocated: 220000.00
    },
    {
      id: 'camp-5',
      title: 'Kisan Krishi Samriddhi: Drip Irrigation & Seed Subsidy Drive',
      description: 'Providing subsidized certified high-yield wheat & mustard seeds, organic bio-fertilizers, and technical drip irrigation layout demonstrations for smallholder farmers.',
      objectives: '1. Distribute certified seed kits to 280 farming families.\n2. Install 15 micro-drip demonstration plots along canal belt.\n3. Conduct soil health card camp covering 500+ agricultural acres.',
      start_date: '2025-10-01',
      end_date: '2025-12-25',
      location: 'Amloda Canal Belt & South Farmlands',
      status: 'Completed',
      manager_id: 'user-ward-3',
      budget_allocated: 180000.00
    }
  ];

  for (const c of campaigns) {
    insertCampaign.run(c.id, c.title, c.description, c.objectives, c.start_date, c.end_date, c.location, c.status, c.manager_id, c.budget_allocated);
  }

  // 5. CAMPAIGN MEMBERS
  const insertMember = db.prepare(`
    INSERT INTO campaign_members (id, campaign_id, user_id, role_in_campaign)
    VALUES (?, ?, ?, ?)
  `);
  insertMember.run('cm-1', 'camp-1', 'user-campaignmgr-1', 'Project Lead');
  insertMember.run('cm-2', 'camp-1', 'user-vol-2', 'Pipeline Supervisor');
  insertMember.run('cm-3', 'camp-1', 'user-volunteer-1', 'Community Liaison');
  insertMember.run('cm-4', 'camp-2', 'user-ward-2', 'Solar Procurement Lead');
  insertMember.run('cm-5', 'camp-2', 'user-vol-5', 'Ward 6 Installation Incharge');
  insertMember.run('cm-6', 'camp-3', 'user-campaignmgr-1', 'Civil Works Incharge');
  insertMember.run('cm-7', 'camp-4', 'user-ward-4', 'Digital Lab Coordinator');
  insertMember.run('cm-8', 'camp-5', 'user-ward-3', 'Krishi Coordinator');

  // 6. TASKS (20 Tasks across Kanban columns)
  const insertTask = db.prepare(`
    INSERT INTO tasks (id, campaign_id, title, description, status, priority, due_date, assigned_to_id, created_by_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tasks = [
    // To Do
    { id: 'tsk-1', campaign_id: 'camp-1', title: 'Procure 5,000 LPH RO membrane & stainless storage tank', description: 'Order certified high-efficiency industrial RO membranes and 10,000L food-grade storage tank from authorized vendor.', status: 'To Do', priority: 'Urgent', due_date: '2026-04-15', assigned_to_id: 'user-campaignmgr-1' },
    { id: 'tsk-2', campaign_id: 'camp-1', title: 'Survey underground pipeline route across Ward 9 & 10', description: 'Mark safe trenching path avoiding electrical poles and household boundary walls.', status: 'To Do', priority: 'High', due_date: '2026-04-18', assigned_to_id: 'user-vol-2' },
    { id: 'tsk-3', campaign_id: 'camp-2', title: 'Finalize pole foundation cement pouring in Ward 4 & 5', description: 'Inspect 20 concrete base plinths for solar street light poles along North approach road.', status: 'To Do', priority: 'Medium', due_date: '2026-04-20', assigned_to_id: 'user-vol-5' },
    { id: 'tsk-4', campaign_id: 'camp-3', title: 'Obtain Public Works Department technical approval for drainage slope', description: 'Verify gravity gradient slope for covered drainage line from Chaupal to canal runoff.', status: 'To Do', priority: 'High', due_date: '2026-04-22', assigned_to_id: 'user-statecoord-1' },
    { id: 'tsk-5', campaign_id: 'camp-4', title: 'Arrange high-speed fiber broadband cable connection at School', description: 'Coordinate with rural optical network team to install 100 Mbps broadband at Senior Secondary School.', status: 'To Do', priority: 'Medium', due_date: '2026-04-25', assigned_to_id: 'user-ward-4' },

    // In Progress
    { id: 'tsk-6', campaign_id: 'camp-1', title: 'Connect pipeline junction from Canal Reservoir to RO Room', description: 'Plumbing crew laying 3-inch CPVC pressure line with flow meter valve.', status: 'In Progress', priority: 'Urgent', due_date: '2026-04-12', assigned_to_id: 'user-vol-2' },
    { id: 'tsk-7', campaign_id: 'camp-2', title: 'Mount 40 solar panels and LED flood heads in Wards 1 to 3', description: 'Mounting brackets and lithium battery boxes installation in northern village alleys.', status: 'In Progress', priority: 'High', due_date: '2026-04-14', assigned_to_id: 'user-ward-2' },
    { id: 'tsk-8', campaign_id: 'camp-4', title: 'Assemble 25 ergonomic computer desks & wiring harnesses', description: 'Local carpenters assembling modular computer tables in Room 14 of school building.', status: 'In Progress', priority: 'Medium', due_date: '2026-04-16', assigned_to_id: 'user-vol-7' },
    { id: 'tsk-9', campaign_id: 'camp-1', title: 'Distribute household smart water dispenser cards to Ward 7 families', description: 'Registering 120 families with RFID refill tap tokens for automated clean drinking water dispensing.', status: 'In Progress', priority: 'High', due_date: '2026-04-19', assigned_to_id: 'user-volunteer-1' },
    { id: 'tsk-10', campaign_id: 'camp-3', title: 'Procure 800 meters of reinforced pre-cast drainage slabs', description: 'Transporting heavy-duty concrete drain covers from district pre-cast yard to Amloda site.', status: 'In Progress', priority: 'Medium', due_date: '2026-04-24', assigned_to_id: 'user-vol-15' },

    // Under Review
    { id: 'tsk-11', campaign_id: 'camp-1', title: 'Water quality laboratory test report from Public Health Engineering Dept', description: 'Sample tested for TDS, fluoride, and microbiological purity before commissioning public taps.', status: 'Under Review', priority: 'High', due_date: '2026-04-10', assigned_to_id: 'user-districtcoord-1' },
    { id: 'tsk-12', campaign_id: 'camp-2', title: 'Inspection report for night illumination in Ward 6 Banyan Chowk', description: 'Panchayat members auditing light intensity and dusk-to-dawn automatic timer sensors.', status: 'Under Review', priority: 'Low', due_date: '2026-04-11', assigned_to_id: 'user-constituency-1' },
    { id: 'tsk-13', campaign_id: 'camp-4', title: 'Educational software syllabus review for Girls Career Corner', description: 'School principal and education committee verifying typing, computer basics, and quiz apps.', status: 'Under Review', priority: 'Medium', due_date: '2026-04-13', assigned_to_id: 'user-ward-5' },
    { id: 'tsk-14', campaign_id: 'camp-1', title: 'Contractor billing audit for RO pump house civil masonry', description: 'Audit verification of brickwork, cement plastering, and waterproofing of filtration shed.', status: 'Under Review', priority: 'Urgent', due_date: '2026-04-12', assigned_to_id: 'user-centraladmin' },
    { id: 'tsk-15', campaign_id: 'camp-3', title: 'Gram Sabha public consultation on shop frontage during road paving', description: 'Resolving shopkeeper questions regarding access ramps along main market road.', status: 'Under Review', priority: 'Medium', due_date: '2026-04-15', assigned_to_id: 'user-superadmin' },

    // Completed
    { id: 'tsk-16', campaign_id: 'camp-1', title: 'Borewell deepening & power transformer energization at RO site', description: 'High-discharge 3-phase submersible pump installed with dedicated transformer.', status: 'Completed', priority: 'High', due_date: '2026-03-20', assigned_to_id: 'user-vol-2' },
    { id: 'tsk-17', campaign_id: 'camp-2', title: 'Receive shipment of 120 certified monocrystalline solar panels', description: 'All 120 solar lighting kits delivered and safely stored in Panchayat Bhavan storeroom.', status: 'Completed', priority: 'Medium', due_date: '2026-03-10', assigned_to_id: 'user-ward-2' },
    { id: 'tsk-18', campaign_id: 'camp-4', title: 'Delivery of 25 desktop computers and laser printer to School', description: 'All hardware inspected, serial numbers recorded in village asset register.', status: 'Completed', priority: 'High', due_date: '2026-03-28', assigned_to_id: 'user-ward-4' },
    { id: 'tsk-19', campaign_id: 'camp-5', title: 'Distribute 280 certified wheat & mustard seed sacks to farmers', description: '100% target achieved across Canal Belt smallholder farming families.', status: 'Completed', priority: 'High', due_date: '2025-11-15', assigned_to_id: 'user-ward-3' },
    { id: 'tsk-20', campaign_id: 'camp-5', title: 'Conduct soil testing camp for 500 agricultural plots', description: 'Soil health cards distributed with customized nitrogen-phosphorus recommendations.', status: 'Completed', priority: 'Medium', due_date: '2025-12-10', assigned_to_id: 'user-vol-4' }
  ];

  for (const t of tasks) {
    insertTask.run(t.id, t.campaign_id, t.title, t.description, t.status, t.priority, t.due_date, t.assigned_to_id, 'user-superadmin');
  }

  // 7. SURVEYS & CIVIC FEEDBACK (Amloda Village Focus)
  const insertSurvey = db.prepare(`
    INSERT INTO surveys (id, title, description, category, status, is_anonymous, created_by_id, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertQuestion = db.prepare(`
    INSERT INTO survey_questions (id, survey_id, question_text, question_type, options, order_index, is_required)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertResponse = db.prepare(`
    INSERT INTO survey_responses (id, survey_id, respondent_token, submitted_at)
    VALUES (?, ?, ?, ?)
  `);

  const insertAnswer = db.prepare(`
    INSERT INTO survey_answers (id, response_id, question_id, answer_value)
    VALUES (?, ?, ?, ?)
  `);

  const surveys = [
    {
      id: 'srv-1',
      title: 'Amloda Household Drinking Water & Pipeline Pressure Feedback',
      description: 'Voluntary anonymous feedback from Amloda residents regarding daily tap water timing, pipeline pressure, and community RO plant requirements.',
      category: 'Drinking Water & Sanitation',
      status: 'Published',
      is_anonymous: 1,
      created_by_id: 'user-superadmin',
      expires_at: '2026-08-30',
      questions: [
        { id: 'sq-1-1', text: 'Which water source does your household in Amloda currently rely upon for daily drinking water?', type: 'single', options: JSON.stringify(['Piped Village Tap Water', 'Community RO Plant', 'Private Tubewell / Borewell', 'Village Handpump', 'Canal Reservoir']) },
        { id: 'sq-1-2', text: 'How satisfied are you with the water cleanliness, taste, and daily supply pressure in your ward?', type: 'rating', options: JSON.stringify(['1 - Very Dissatisfied', '2 - Dissatisfied', '3 - Neutral', '4 - Satisfied', '5 - Very Satisfied']) },
        { id: 'sq-1-3', text: 'What is the top water infrastructure priority the Gram Panchayat should complete next?', type: 'mcq', options: JSON.stringify(['Morning & Evening fixed 2-hour tap schedule', 'Extend underground pipeline to outer fields (Dhani)', 'Install solar backup on borewell motor', 'Construct covered rainwater harvesting tank at Chaupal', 'Regular monthly water filter testing']) },
        { id: 'sq-1-4', text: 'Please share any specific pipeline leak or pressure issue in your ward:', type: 'text', options: null }
      ]
    },
    {
      id: 'srv-2',
      title: 'Amloda Primary Health Center & Emergency Ambulance Access Survey',
      description: 'Community feedback on doctor availability, essential medicine stock, and ambulance response time in Amloda sub-center.',
      category: 'Healthcare & Wellness',
      status: 'Published',
      is_anonymous: 1,
      created_by_id: 'user-districtcoord-1',
      expires_at: '2026-07-31',
      questions: [
        { id: 'sq-2-1', text: 'When you or your family visited the Amloda Health Sub-Center, were prescribed medicines available free of charge?', type: 'single', options: JSON.stringify(['Always fully available', 'Partially available', 'Rarely available', 'Had to buy from outside medical shop']) },
        { id: 'sq-2-2', text: 'Rate overall cleanliness and emergency readiness of the Amloda Health Sub-Center:', type: 'rating', options: JSON.stringify(['1 - Poor', '2 - Fair', '3 - Good', '4 - Very Good', '5 - Excellent']) },
        { id: 'sq-2-3', text: 'Which additional healthcare facility should be prioritized for Amloda?', type: 'mcq', options: JSON.stringify(['Dedicated 24x7 delivery & maternity room', 'Weekly specialist doctor visiting camp', 'Permanent village ambulance stationed at Panchayat', 'Free laboratory blood test counter']) }
      ]
    },
    {
      id: 'srv-3',
      title: 'Amloda School Infrastructure & Girls Education Bus Route Feedback',
      description: 'Understanding village parent suggestions for Government Senior Secondary School facilities, sports playground, and girls transport.',
      category: 'Education & Youth',
      status: 'Published',
      is_anonymous: 1,
      created_by_id: 'user-ward-5',
      expires_at: '2026-09-15',
      questions: [
        { id: 'sq-3-1', text: 'What educational facility does Amloda Senior Secondary School need most urgently?', type: 'single', options: JSON.stringify(['Digital Computer Lab & Internet', 'Science Practical Laboratory', 'Clean Drinking Water & Modern Girls Toilet', 'Sports Ground with Track & Basketball', 'Safe School Bus Transport from outlying farms']) },
        { id: 'sq-3-2', text: 'How satisfied are you with the midday meal quality and teacher attendance?', type: 'rating', options: JSON.stringify(['1 - Poor', '2 - Acceptable', '3 - Satisfactory', '4 - Very Good', '5 - Outstanding']) }
      ]
    },
    {
      id: 'srv-4',
      title: 'Amloda Farmer Agricultural Support & Canal Irrigation Survey',
      description: 'Farmer feedback on irrigation canal release timings, solar pump subsidy guidance, and crop procurement centers.',
      category: 'Agriculture & Irrigation',
      status: 'Published',
      is_anonymous: 1,
      created_by_id: 'user-ward-3',
      expires_at: '2026-08-15',
      questions: [
        { id: 'sq-4-1', text: 'Which agricultural assistance scheme would most benefit your farmlands in Amloda?', type: 'mcq', options: JSON.stringify(['Solar pump subsidy installation', 'Drip & sprinkler irrigation kits', 'Warehouse cold storage for harvested crops', 'Organic manure & bio-fertilizer supply', 'Kisan credit card processing camp at Panchayat']) },
        { id: 'sq-4-2', text: 'How timely was canal water release during the Rabi crop sowing season?', type: 'single', options: JSON.stringify(['Fully on time', 'Delayed by 1-2 weeks', 'Insufficient canal flow', 'Did not receive canal water']) }
      ]
    },
    {
      id: 'srv-5',
      title: 'Gram Panchayat Amloda Annual Development & Budget Transparency Audit',
      description: 'Annual citizen audit assessing public works quality, Panchayat meeting announcements, and grievance redressal.',
      category: 'Gram Governance',
      status: 'Closed',
      is_anonymous: 1,
      created_by_id: 'user-superadmin',
      expires_at: '2026-01-31',
      questions: [
        { id: 'sq-5-1', text: 'Do you feel Gram Panchayat decisions and development fund expenditures are shared transparently in Gram Sabha meetings?', type: 'rating', options: JSON.stringify(['1 - Not Transparent', '2 - Somewhat Transparent', '3 - Neutral', '4 - Transparent', '5 - Highly Transparent & Open']) },
        { id: 'sq-5-2', text: 'How responsive is the Sarpanch and Ward Panch when you report a civic issue?', type: 'rating', options: JSON.stringify(['1 - Unresponsive', '2 - Slow', '3 - Adequate', '4 - Prompt & Helpful', '5 - Immediate Resolution']) }
      ]
    }
  ];

  for (const s of surveys) {
    insertSurvey.run(s.id, s.title, s.description, s.category, s.status, s.is_anonymous, s.created_by_id, s.expires_at);
    let order = 1;
    for (const q of s.questions) {
      insertQuestion.run(q.id, s.id, q.text, q.type, q.options, order++, 1);
    }
  }

  // Populate sample responses for Amloda Water Survey (srv-1)
  const sampleResponsesSrv1 = [
    { src: 'Piped Village Tap Water', rate: '4', priority: 'Morning & Evening fixed 2-hour tap schedule', text: 'Ward 8 needs 15-minute extra pressure during evening 6 PM.' },
    { src: 'Community RO Plant', rate: '5', priority: 'Extend underground pipeline to outer fields (Dhani)', text: 'The community RO water is very sweet and clean. We need an extra dispenser tap.' },
    { src: 'Private Tubewell / Borewell', rate: '3', priority: 'Install solar backup on borewell motor', text: 'Frequent power cuts in morning affect water filling. Solar motor is essential.' },
    { src: 'Piped Village Tap Water', rate: '4', priority: 'Morning & Evening fixed 2-hour tap schedule', text: 'Fix the small pipe joint leakage near the Banyan tree chowk.' },
    { src: 'Community RO Plant', rate: '4', priority: 'Extend underground pipeline to outer fields (Dhani)', text: 'Canal water is clean, pipeline work should reach Ward 11 farms soon.' },
    { src: 'Piped Village Tap Water', rate: '5', priority: 'Morning & Evening fixed 2-hour tap schedule', text: 'Great improvement over last year. Pressurized taps reach first floor.' },
    { src: 'Village Handpump', rate: '2', priority: 'Extend underground pipeline to outer fields (Dhani)', text: 'Handpump in Ward 10 has brackish water. Please connect new pipeline.' },
    { src: 'Community RO Plant', rate: '4', priority: 'Regular monthly water filter testing', text: 'Good initiative. Keep RFID dispenser active on Sundays.' }
  ];

  let rIdx = 1;
  for (const sr of sampleResponsesSrv1) {
    const respId = `resp-1-${rIdx++}`;
    insertResponse.run(respId, 'srv-1', `anon-amloda-${Math.random().toString(36).substring(2, 9)}`, '2026-03-24 11:20:00');
    insertAnswer.run(`ans-${respId}-1`, respId, 'sq-1-1', sr.src);
    insertAnswer.run(`ans-${respId}-2`, respId, 'sq-1-2', sr.rate);
    insertAnswer.run(`ans-${respId}-3`, respId, 'sq-1-3', sr.priority);
    insertAnswer.run(`ans-${respId}-4`, respId, 'sq-1-4', sr.text);
  }

  // Populate responses for Amloda Health Survey (srv-2)
  const sampleResponsesSrv2 = [
    { med: 'Always fully available', rate: '4', facil: 'Dedicated 24x7 delivery & maternity room' },
    { med: 'Partially available', rate: '4', facil: 'Permanent village ambulance stationed at Panchayat' },
    { med: 'Always fully available', rate: '5', facil: 'Weekly specialist doctor visiting camp' },
    { med: 'Partially available', rate: '3', facil: 'Dedicated 24x7 delivery & maternity room' },
    { med: 'Always fully available', rate: '4', facil: 'Free laboratory blood test counter' },
    { med: 'Always fully available', rate: '5', facil: 'Permanent village ambulance stationed at Panchayat' }
  ];
  let rIdx2 = 1;
  for (const sr of sampleResponsesSrv2) {
    const respId = `resp-2-${rIdx2++}`;
    insertResponse.run(respId, 'srv-2', `anon-amloda-${Math.random().toString(36).substring(2, 9)}`, '2026-03-26 15:45:00');
    insertAnswer.run(`ans-${respId}-1`, respId, 'sq-2-1', sr.med);
    insertAnswer.run(`ans-${respId}-2`, respId, 'sq-2-2', sr.rate);
    insertAnswer.run(`ans-${respId}-3`, respId, 'sq-2-3', sr.facil);
  }

  // 8. EVENTS (Amloda Village Assemblies & Camps)
  const insertEvent = db.prepare(`
    INSERT INTO events (id, title, description, category, date_time, venue, coordinator_id, expected_attendance, actual_attendance, budget, status, logistics_checklist)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const events = [
    {
      id: 'evt-1',
      title: 'Open Gram Sabha & Village Budget Assembly at Panchayat Bhavan',
      description: 'Public gathering of all adult residents of Amloda to review village development expenditures, approve new solar lighting locations, and audit water pipeline progress with the Sarpanch and Ward Members.',
      category: 'Town Hall',
      date_time: '2026-05-10 10:00:00',
      venue: 'Gram Panchayat Bhavan Courtyard, Amloda Village',
      coordinator_id: 'user-superadmin',
      expected_attendance: 650,
      actual_attendance: 0,
      budget: 25000.00,
      status: 'Upcoming',
      logistics_checklist: JSON.stringify([
        { id: '1', item: 'Shaded shamiana tent and carpet seating for 700 villagers', done: true },
        { id: '2', item: 'Public address sound system and wireless microphones for citizen questions', done: true },
        { id: '3', item: 'Printed copies of FY2026 Amloda development expenditure ledger', done: false },
        { id: '4', item: 'Drinking water pots and paper cups station staffed by youth volunteers', done: false },
        { id: '5', item: 'Official Gram Sabha resolution register (कार्यवाही रजिस्टर) verified', done: false }
      ])
    },
    {
      id: 'evt-2',
      title: 'Amloda Free Multi-Specialty Health & Eye Screening Camp',
      description: 'Free consultations by visiting doctors from District Hospital, free eye cataract checkups with spectacles distribution, and pediatric immunizations for children.',
      category: 'Community Outreach',
      date_time: '2026-04-28 09:00:00',
      venue: 'Community Center & Sub-Center Hall, Ward 5, Amloda',
      coordinator_id: 'user-districtcoord-1',
      expected_attendance: 400,
      actual_attendance: 0,
      budget: 35000.00,
      status: 'Upcoming',
      logistics_checklist: JSON.stringify([
        { id: '1', item: '3 examination rooms set up with clean medical beds and screens', done: true },
        { id: '2', item: 'Pharmacy distribution counter stocked with free medicines and eye drops', done: true },
        { id: '3', item: 'Senior citizen registration desk with token queue system', done: false },
        { id: '4', item: 'Ambulance vehicle on standby for emergency referrals', done: true }
      ])
    },
    {
      id: 'evt-3',
      title: 'Annual Amloda Khel Mahotsav & Kisan Krishi Mela',
      description: 'Village sports championships (Kabaddi, Volleyball, 100m sprint), farming innovation stall displays, and awards ceremony for meritorious village girls and organic farmers.',
      category: 'Convention',
      date_time: '2026-03-12 09:30:00',
      venue: 'Amloda Village Senior Secondary School Stadium Ground',
      coordinator_id: 'user-statecoord-1',
      expected_attendance: 800,
      actual_attendance: 940,
      budget: 45000.00,
      status: 'Completed',
      logistics_checklist: JSON.stringify([
        { id: '1', item: 'Marked Kabaddi mat and Volleyball court with referee stand', done: true },
        { id: '2', item: 'Trophies, certificates, and brass medals for winning ward teams', done: true },
        { id: '3', item: 'Kisan demonstration stall showcasing drip irrigation and organic bio-fertilizers', done: true },
        { id: '4', item: 'Community refreshments and tea counter for 1,000 visitors', done: true }
      ])
    }
  ];

  for (const e of events) {
    insertEvent.run(e.id, e.title, e.description, e.category, e.date_time, e.venue, e.coordinator_id, e.expected_attendance, e.actual_attendance, e.budget, e.status, e.logistics_checklist);
  }

  // 9. BUDGETS & EXPENSES (Amloda Panchayat Accounts)
  const insertBudget = db.prepare(`
    INSERT INTO budgets (id, campaign_id, unit_id, title, fiscal_year, allocated_amount, spent_amount, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const budgets = [
    { id: 'bgt-1', campaign_id: 'camp-1', unit_id: 'unit-amloda-panchayat', title: 'Jal Jeevan Mission Amloda Clean Water Fund', fiscal_year: '2026', allocated_amount: 480000.00, spent_amount: 142500.00, notes: 'RO machinery, filtration shed, CPVC pipes, RFID smart card dispenser' },
    { id: 'bgt-2', campaign_id: 'camp-2', unit_id: 'unit-amloda-panchayat', title: 'Amloda Solar Street Light Installation Grant', fiscal_year: '2026', allocated_amount: 320000.00, spent_amount: 185000.00, notes: '120 solar LED street poles, concrete bases, lithium battery kits' },
    { id: 'bgt-3', campaign_id: 'camp-4', unit_id: 'unit-ward-north', title: 'Village Senior Secondary School Digital Lab Fund', fiscal_year: '2026', allocated_amount: 220000.00, spent_amount: 195000.00, notes: '25 desktop PCs, laser printer, broadband router, furniture' },
    { id: 'bgt-4', campaign_id: null, unit_id: 'unit-amloda-panchayat', title: '15th Finance Commission Amloda Gram Vikas Fund', fiscal_year: '2026', allocated_amount: 550000.00, spent_amount: 120000.00, notes: 'Internal roads maintenance, sanitation waste management, street repairs' }
  ];

  for (const b of budgets) {
    insertBudget.run(b.id, b.campaign_id, b.unit_id, b.title, b.fiscal_year, b.allocated_amount, b.spent_amount, b.notes);
  }

  const insertExpense = db.prepare(`
    INSERT INTO expenses (id, campaign_id, budget_id, title, description, category, amount, transaction_date, receipt_url, submitted_by_id, status, approval_notes, reviewed_by_id, reviewed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const expenses = [
    { id: 'exp-1', campaign_id: 'camp-1', budget_id: 'bgt-1', title: '5,000 LPH RO Filtration Unit & Pressure Vessel Deposit', description: 'Commercial RO filtration unit, sand filter vessels, and chemical dosing pump for Amloda water shed.', category: 'Logistics', amount: 85000.00, date: '2026-03-02', receipt: null, sub: 'user-campaignmgr-1', status: 'Approved', notes: 'Certified by Public Health Engineering Dept. Approved for immediate installation.', rev: 'user-superadmin', rev_at: '2026-03-04 10:15:00' },
    { id: 'exp-2', campaign_id: 'camp-1', budget_id: 'bgt-1', title: '800 meters heavy-duty CPVC Water Pipeline for Ward 8 & 9', description: 'Pipeline supply for extending drinking water connection to 110 household taps.', category: 'Logistics', amount: 38500.00, date: '2026-03-12', receipt: null, sub: 'user-vol-2', status: 'Approved', notes: 'Checked invoice against trenching measurements.', rev: 'user-centraladmin', rev_at: '2026-03-14 11:30:00' },
    { id: 'exp-3', campaign_id: 'camp-2', budget_id: 'bgt-2', title: '40 Monocrystalline 100W Solar Panels & LiFePO4 Batteries', description: 'First batch of solar street lighting modules for Amloda North & Chaupal.', category: 'Media & Advertising', amount: 120000.00, date: '2026-03-18', receipt: null, sub: 'user-ward-2', status: 'Approved', notes: 'Approved under Renewable Village Energy Scheme.', rev: 'user-superadmin', rev_at: '2026-03-19 14:00:00' },
    { id: 'exp-4', campaign_id: 'camp-4', budget_id: 'bgt-3', title: '25 Desktop Computers & Laser Printer for School Digital Lab', description: 'Branded desktop PCs preloaded with digital curriculum and student study suite.', category: 'Printing & Materials', amount: 165000.00, date: '2026-03-25', receipt: null, sub: 'user-ward-4', status: 'Approved', notes: 'Delivered and verified in school computer room.', rev: 'user-centraladmin', rev_at: '2026-03-26 16:30:00' },
    { id: 'exp-5', campaign_id: null, budget_id: 'bgt-4', title: 'Village Chaupal Banyan Tree Shaded Seating Masonry', description: 'Constructing stone and marble seating platform around central banyan tree for elders and gatherings.', category: 'Venue & Rentals', amount: 28000.00, date: '2026-03-29', receipt: null, sub: 'user-constituency-1', status: 'Approved', notes: 'Historical village heritage maintenance.', rev: 'user-superadmin', rev_at: '2026-03-30 09:30:00' },
    { id: 'exp-6', campaign_id: 'camp-1', budget_id: 'bgt-1', title: 'Automated RFID Smart Card Tap Dispenser Machine', description: 'Coin & RFID contactless card dispenser for 20L clean water cans.', category: 'Logistics', amount: 19000.00, date: '2026-04-01', receipt: null, sub: 'user-campaignmgr-1', status: 'Approved', notes: 'Essential for fair distribution without wastage.', rev: 'user-centraladmin', rev_at: '2026-04-02 12:45:00' },
    { id: 'exp-7', campaign_id: 'camp-2', budget_id: 'bgt-2', title: 'Pole Foundation Concrete Masonry in Wards 7, 8, and 10', description: 'Cement, sand, gravel and labor for fixing 35 solar light poles.', category: 'Logistics', amount: 24500.00, date: '2026-04-03', receipt: null, sub: 'user-vol-5', status: 'Pending', notes: null, rev: null, rev_at: null },
    { id: 'exp-8', campaign_id: null, budget_id: 'bgt-4', title: 'Shamiana Tent & Public Sound System for Upcoming Gram Sabha', description: 'Advance booking for village assembly tent, 600 chairs, and public address audio.', category: 'Venue & Rentals', amount: 14500.00, date: '2026-04-04', receipt: null, sub: 'user-centraladmin', status: 'Pending', notes: null, rev: null, rev_at: null },
    { id: 'exp-9', campaign_id: 'camp-1', budget_id: 'bgt-1', title: 'Water Chemical Test Kits & Spare Filter Cartridges', description: 'Quarterly supply of chlorine test strips, sediment filters, and calibration buffer solution.', category: 'Miscellaneous', amount: 6800.00, date: '2026-04-05', receipt: null, sub: 'user-vol-2', status: 'Pending', notes: null, rev: null, rev_at: null },
    { id: 'exp-10', campaign_id: 'camp-4', budget_id: 'bgt-3', title: '1-Year High-Speed Fiber Internet Connection for School Lab', description: 'Annual commercial broadband subscription with 100 Mbps symmetric speed.', category: 'Miscellaneous', amount: 12000.00, date: '2026-04-05', receipt: null, sub: 'user-ward-4', status: 'Pending', notes: null, rev: null, rev_at: null }
  ];

  for (const exp of expenses) {
    insertExpense.run(exp.id, exp.campaign_id, exp.budget_id, exp.title, exp.description, exp.category, exp.amount, exp.date, exp.receipt, exp.sub, exp.status, exp.notes, exp.rev, exp.rev_at);
  }

  // 10. ANNOUNCEMENTS (Amloda Village Bulletins)
  const insertAnnouncement = db.prepare(`
    INSERT INTO announcements (id, title, content, target_type, target_id, priority, author_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const announcements = [
    {
      id: 'anc-1',
      title: 'Amloda Gram Sabha Meeting Notice: May 10 at Panchayat Bhavan Courtyard',
      content: 'All adult residents, farmers, and youth of Amloda village are cordially invited to attend the General Gram Sabha on May 10 at 10:00 AM. Agenda includes auditing the RO water facility, approving the solar light map for Wards 7–12, and inspecting internal road paving proposals. Refreshments provided.',
      target_type: 'All',
      target_id: null,
      priority: 'Urgent',
      author_id: 'user-superadmin'
    },
    {
      id: 'anc-2',
      title: 'Free Health & Eye Checkup Camp this Sunday at Community Center (Ward 5)',
      content: 'District hospital specialist doctors and optometrists will be present for free health consultations, eye cataract screening, and free reading glasses distribution on April 28 from 9:00 AM to 4:00 PM. Please bring your Aadhaar and health cards.',
      target_type: 'All',
      target_id: null,
      priority: 'Important',
      author_id: 'user-districtcoord-1'
    },
    {
      id: 'anc-3',
      title: 'Drinking Water Pipeline Testing Schedule for Wards 7, 8 & 9',
      content: 'New underground pipeline pressure testing will run from 4:00 PM to 6:00 PM this Thursday. Villagers are requested to check their household stopcocks and inform Gram Sevak Deepak if any joint bubbles are noticed.',
      target_type: 'All',
      target_id: null,
      priority: 'Normal',
      author_id: 'user-campaignmgr-1'
    }
  ];

  for (const a of announcements) {
    insertAnnouncement.run(a.id, a.title, a.content, a.target_type, a.target_id, a.priority, a.author_id);
  }

  // 11. NOTIFICATIONS
  const insertNotification = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, link, is_read)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const notifications = [
    { id: 'notif-1', user_id: 'user-superadmin', title: 'New Gram Vikas Expense Claim Submitted', message: 'Vikram Singh submitted claim of ₹24,500 for solar pole foundation concrete masonry.', type: 'expense', link: '/finances', is_read: 0 },
    { id: 'notif-2', user_id: 'user-centraladmin', title: 'Water Plant Milestone Achieved', message: 'RO pump house construction and power transformer energized in Ward 7.', type: 'task', link: '/campaigns/camp-1', is_read: 0 },
    { id: 'notif-3', user_id: 'user-volunteer-1', title: 'Task Assignment for Cleanliness Drive', message: 'You are assigned to coordinate clean drinking water tokens distribution.', type: 'task', link: '/campaigns/camp-1', is_read: 0 },
    { id: 'notif-4', user_id: 'user-districtcoord-1', title: 'Health Camp Preparations', message: 'Doctor confirmation received from District Hospital for April 28 camp.', type: 'event', link: '/events', is_read: 1 },
    { id: 'notif-5', user_id: 'user-superadmin', title: 'Amloda System Audit Clean', message: 'All 12 Ward asset ledgers synchronized with local SQLite database.', type: 'system', link: '/audit-logs', is_read: 1 }
  ];

  for (const n of notifications) {
    insertNotification.run(n.id, n.user_id, n.title, n.message, n.type, n.link, n.is_read);
  }

  // 12. AUDIT LOGS
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertAudit.run('aud-1', 'user-superadmin', 'INITIALIZE_AMLODA_SYSTEM', 'Database', 'politix.db', JSON.stringify({ village: 'Amloda', panchayat: 'Gram Panchayat Amloda', engine: 'better-sqlite3' }), '127.0.0.1');
  insertAudit.run('aud-2', 'user-superadmin', 'APPROVE_EXPENSE', 'Expense', 'exp-1', JSON.stringify({ amount: 85000, vendor: 'Industrial RO Technologies', purpose: 'Amloda Clean Water Plant' }), '127.0.0.1');
  insertAudit.run('aud-3', 'user-campaignmgr-1', 'CREATE_CAMPAIGN', 'Campaign', 'camp-1', JSON.stringify({ title: 'Amloda Clean Drinking Water & RO Plant Drive' }), '127.0.0.1');
  insertAudit.run('aud-4', 'user-superadmin', 'DEPLOY_SURVEY', 'Survey', 'srv-1', JSON.stringify({ title: 'Amloda Household Drinking Water Survey' }), '127.0.0.1');

  console.log('Amloda Village database seeding completed successfully with 30 council members & volunteers, 5 campaigns, 20 tasks, 5 surveys, 3 events, and 10 village expenses!');
}
