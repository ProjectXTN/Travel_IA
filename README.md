# Travel IA

Planejador de viagens em português, francês e inglês. O frontend usa React e o backend usa Express e OpenRouter.

## Executar localmente

Use Node.js 20 ou superior. Em um terminal na raiz do projeto, inicie a API.

```powershell
cd backend
npm ci
node server.js
```

Configure `OPENROUTER_API_KEY` em `backend/.env`. O modelo preferido é `nvidia/nemotron-3.5-lightning:free`, com `openrouter/free` como reserva. Para priorizar outra variante gratuita, defina `OPENROUTER_MODEL` com um ID terminado em `:free`. O site apresenta o roteiro por linhas durante a geração. O servidor reaproveita pedidos idênticos concluídos por 30 minutos, enquanto a instância estiver ativa. A API escuta na porta 5000, configurável por `PORT`. A chave `GOOGLE_MAPS_API_KEY` só é usada por clientes que chamam `/api/geocode`.

Em outro terminal na raiz, inicie o site.

```powershell
cd front-end
npm ci
npm start
```

Abra [o planejador local](http://localhost:3000). As rotas de idioma são `/pt-br`, `/fr` e `/en`.

## Produção

Defina `REACT_APP_BACKEND_URL` com o endereço público da API no ambiente de build do frontend. Rode `npm run build` em `front-end` e configure a hospedagem estática para servir `index.html` nas rotas de idioma. No servidor da API, defina a chave do OpenRouter e execute `node server.js` em `backend`.

## Testar o planejador

Em `front-end`, execute `npm test -- --watchAll=false --runInBand`. Os testes cobrem a seleção de destinos, interesses personalizados, idiomas, apresentação do roteiro e recuperação de falhas de serviço.
