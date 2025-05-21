# Descrição do Teste Técnico

## Como começar
- Faça um fork deste teste na sua conta do github.
- Crie uma branch com o seu nome.
- Realize commits com frequencia.

## Objetivo
Implementar uma API REST que:
- Receba um arquivo CSV contendo operações financeiras.
- Realize validações específicas nas operações.
- Registre as operações validadas em um banco de dados.
- Gere um resumo das operações não validadas.

## Requisitos Funcionais

### Recebimento do Arquivo
- A API deve oferecer um endpoint para o upload de arquivos CSV.
- O arquivo deve seguir o formato especificado: `from;to;amount`.

### Validações
1. **Valores Negativos**: Operações com valores negativos são consideradas inválidas.
2. **Operações Duplicadas**: Uma operação é duplicada se existir outra operação no arquivo com os mesmos valores de `to`, `from`, e `amount`. Tais operações são consideradas inválidas.
3. **Valores Suspeitos**: Operações com valores acima de R$50.000,00 são marcadas como suspeitas, mas ainda válidas para inclusão no banco de dados.
4. Os Valores estão em centavos, desta forma 100 = R$1

### Processamento do Arquivo
- O arquivo deve ser lido e as operações devem ser validadas conforme as regras acima.
- As operações validadas devem ser armazenadas em um banco  de dados (você decide).
- Um resumo das operações não validadas (com o motivo da invalidade) deve ser gerado e armazenado no banco de dados juntamente com o nome do arquivo.

### Resposta da API
Após o processamento do arquivo, a  API deve retornar uma resposta contendo:
- Número de operações validadas e inseridas no banco de dados.
- Resumo das operações não validadas, incluindo o motivo.

### Geraçao do Arquivo
- Utilize o script transactionGenerator.js para gerar o arquivo com as transaçoes.

### O que esperamos:
- Uso de Node.js com TypeScript.
- Aplicação de conceitos para a criação de uma API REST eficiente.
- Estratégias para a solução de problemas em tempo real.
- Capacidade de testar e validar sua solução.
- Dockerização da aplicação (se possível dentro do tempo alocado).
- Persistência em banco de dados.

### Critérios de Avaliação:
- Testabilidade e Manutenibilidade.
- Eficiência e Preparo para Escalabilidade.
- Modularidade, Organização e Reutilização de Código.
- A preocupação com segurança também será considerada um plus na sua solução.
