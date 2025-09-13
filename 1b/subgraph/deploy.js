const { exec } = require('child_process');

async function deploySubgraph() {
  // Create subgraph
  exec('graph create --node http://localhost:8020/ miniamm', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error creating subgraph: ${error}`);
      return;
    }
    
    // Deploy subgraph
    exec('graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001 miniamm', 
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error deploying subgraph: ${error}`);
          return;
        }
        console.log('Subgraph deployed successfully!');
    });
  });
}

deploySubgraph();