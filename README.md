<div align="center">
<img width="1200" height="475" alt="Gerador de Email Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# ✈️ Gerador de Email - Clube do Voo

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-31adbb.svg)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-IA-orange.svg)](https://ai.google.dev/)

</div>

## 📝 Descrição

O **Gerador de Email** é uma ferramenta inteligente desenvolvida para automatizar a criação de confirmações de voo e lembretes para clientes do Clube do Voo. Utilizando a potência do **Google Gemini AI**, o sistema extrai automaticamente dados de bilhetes aéreos (PDF ou Imagem) e gera templates profissionais prontos para envio.

### ✨ Principais Funcionalidades

- 🧠 **Extração com IA:** Processa bilhetes únicos ou voos de ida e volta separados.
- ✉️ **Templates Dinâmicos:** Gera e-mails em HTML nos estilos Clássico, Minimalista ou Urgente.
- 📱 **Mensagens WhatsApp:** Cria textos formatados automaticamente para envio rápido via WhatsApp.
- 📧 **Integração EmailJS:** Envio de e-mail direto pela aplicação.
- 📊 **Dashboard:** Acompanhamento de métricas e histórico de extrações.
- ⚙️ **Configuração Flexível:** Suporte para chaves de API do Gemini e OpenAI.

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js (versão 18 ou superior)
- Uma chave de API do [Google Gemini AI](https://aistudio.google.com/)

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/joabhtyk/gerador-de-email.git
   cd gerador-de-email
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto.
   - Adicione sua chave: `VITE_GEMINI_API_KEY=sua_chave_aqui`

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 19, Lucide React, Framer Motion.
- **Estilização:** Tailwind CSS 4.
- **Inteligência Artificial:** Google Generative AI (Gemini 2.0 Flash).
- **Build Tool:** Vite.
- **Comunicação:** EmailJS.

---
<div align="center">
Desenvolvido com ❤️ para o Clube do Voo.
</div>
