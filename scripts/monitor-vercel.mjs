import * as dotenv from 'dotenv';
dotenv.config();

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = "prj_46FviliVjV8J6HnU0tLKhkwzbDjy";
const TEAM_ID = "team_ZvIj2SPBuYgxVhaio0Rkro5b";

if (!VERCEL_TOKEN) {
  console.error("❌ Erro: VERCEL_TOKEN não encontrado no arquivo .env");
  process.exit(1);
}

async function monitorDeployment() {
  const url = `https://api.vercel.com/v6/deployments?projectId=${PROJECT_ID}&teamId=${TEAM_ID}&limit=1`;
  
  console.log("👀 Iniciando monitoramento em tempo real...");

  while (true) {
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
      });
      const data = await response.json();
      
      if (data.deployments && data.deployments.length > 0) {
        const deploy = data.deployments[0];
        process.stdout.write(`\r🔄 Status Atual: ${deploy.readyState} | URL: ${deploy.url}        `);
        
        if (deploy.readyState === 'READY') {
          console.log(`\n\n✅ DEPLOY CONCLUÍDO COM SUCESSO!`);
          break;
        }
        
        if (deploy.readyState === 'ERROR' || deploy.readyState === 'CANCELED') {
          console.log(`\n\n❌ Erro no Deploy: ${deploy.readyState}`);
          break;
        }
      }
    } catch (error) {
      console.error("\n❌ Erro de conexão:", error.message);
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}

monitorDeployment();
