const mockDb = {
    query: async (query, values) => {
    //   console.log('Mock query executed:', query, values);
      // Simulate a successful insert with a mock response
      if (query.includes('INSERT INTO reports')) {
        return {
          rows: [{
            task_id: values[0],
            task_type: values[1],
            work_package: values[2],
            completed_date: values[3],
            total_length: values[4],
            qa_approved: values[5]
          }]
        };
      }
      // Simulate a SELECT NOW() query for the test route
      if (query.includes('SELECT NOW()')) {
        return {
          rows: [{ now: new Date().toISOString() }]
        };
      }
      return { rows: [] };
    }
  };
  
  module.exports = mockDb;