const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eliilfvunxsmzhepvxyz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaWlsZnZ1bnhzbXpoZXB2eHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NzMzMjIsImV4cCI6MjEwMDE0OTMyMn0.l8MGOEV8YJLbWJgzsfEDTxlHb8nkoVn7EfUzfkdS4-w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDb() {
  console.log('Fetching grouped counts...');
  
  // Since grouped aggregates aren't directly supported by simple select without rpc, we'll fetch all
  const { data: allModules, error: err2 } = await supabase
    .from('learning_modules')
    .select('id, category_id, xp_reward, tier, estimated_time, order_index');

  if (err2) {
    console.error('Error:', err2);
    return;
  }

  const stats = {};
  allModules.forEach(m => {
    if (!stats[m.category_id]) {
      stats[m.category_id] = { total: 0, core: 0, advanced: 0, missingTime: 0 };
    }
    stats[m.category_id].total++;
    if (m.tier === 'core') stats[m.category_id].core++;
    if (m.tier === 'advanced') stats[m.category_id].advanced++;
    if (!m.estimated_time) stats[m.category_id].missingTime++;
  });

  console.log('--- DATABASE STATUS ---');
  console.log(`Total Modules: ${allModules.length}`);
  Object.keys(stats).forEach(cat => {
    console.log(`Category [${cat}]: ${stats[cat].total} modules (Core: ${stats[cat].core}, Adv: ${stats[cat].advanced}) | Missing Time: ${stats[cat].missingTime}`);
  });
}

checkDb();
