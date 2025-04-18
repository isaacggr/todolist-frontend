# TodoList Frontend

Este é o frontend da aplicação TodoList, um gerenciador de tarefas simples e eficiente.

## Funcionalidades

-  Cadastro e login de usuários
-  Criação, leitura, atualização e exclusão de tarefas
-  Filtragem de tarefas por prioridade
-  Interface responsiva e intuitiva

## Tecnologias Utilizadas

-  HTML5
-  CSS3
-  JavaScript (puro, sem frameworks)
-  Integração com API RESTful

## Como Executar Localmente

1. Clone este repositório
2. Abra o arquivo `index.html` em um navegador
3. Certifique-se de que o backend está rodando na URL configurada no arquivo `config.js`

## Configuração da API

Por padrão, este frontend está configurado para se comunicar com o backend em `http://localhost:8080`.

### Arquivo de Configuração

A URL da API é configurada através do arquivo `config.js` na raiz do projeto:

```javascript
const API_BASE_URL = 'http://localhost:8080';
```

Para ambientes de produção, você deve alterar esta URL para apontar para o servidor de backend implantado:

```javascript
const API_BASE_URL = 'https://seu-backend.onrender.com';
```

## Implantação

Este projeto foi projetado para ser facilmente implantado em qualquer serviço de hospedagem estática:

### GitHub Pages

1. Crie um novo repositório no GitHub
2. Faça push deste código para o repositório
3. Ative o GitHub Pages nas configurações do repositório
4. Selecione a branch `main` como fonte

### Netlify/Vercel

1. Conecte seu repositório GitHub ao Netlify ou Vercel
2. Configure o diretório raiz como base da implantação
3. Não é necessário configurar comandos de build

### Configuração para Produção

Antes de implantar, certifique-se de:

1. Editar o arquivo `config.js` para apontar para o URL do seu backend em produção
2. Verificar se o backend tem as configurações CORS corretas para permitir requisições do domínio onde o frontend será hospedado

## Integração com o Backend

Este frontend funciona em conjunto com o backend TodoList (Spring Boot + MongoDB). Para manter ambos sincronizados:

1. Quando fizer alterações nas APIs do backend, atualize as chamadas correspondentes no frontend
2. Mantenha o arquivo `config.js` atualizado com a URL correta do backend
3. Utilize o script de implantação fornecido no repositório do backend para configurar o frontend para produção
