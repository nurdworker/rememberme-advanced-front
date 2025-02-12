# Remember Me

A serverless vocabulary memorization website built on AWS Lambda.

![Application Image](https://github.com/vocaAppServerless/.github/blob/main/assets/img/rememberme_app.png?raw=true)

## Tech Stack

- Frontend   : React
- Backend:   : Node.js, AWS SAM CLI
- Database   : MongoDB
- CI/CD      : GitHub Actions
- Cloud(AWS) : Lambda, API Gateway, S3, CloudFront, Route53, WAF, Parameter Store, Secrets Manager, Budgets, Chatbot
- IaC        : Terraform(HCP Terraform)
- Logging    : CloudWatch, Logstash, Elasticsearch, Kibana
- ETC        : Git/GitHub, Slack, Notion

## Development

> **⚠️ Note**: This repository is currently a demo version and is continuously being updated. Please refer to the [GitHub repository](https://github.com/nurdworker/rememberme) for the latest updates.  

### 🎬 Implementation Demo Video:  

- <https://youtu.be/y15djTDnXYg>
  
### **Frontent Dev Environment**

#### React Project Setup and Running Guide

1. **Clone our project repository**
```bash
git clone https://github.com/vocaAppServerless/frontend.git
```
2. **Install Dependencies and run**
Before starting the React project, you need to install the required dependencies. Run the following command:
```bash
npm install
```
3. **Start the Application**
```bash
npm start
```

### **Backend**
1. **Clone our project repository**
```bash
git clone https://github.com/vocaAppServerless/backend.git
```
2. **Install AWS SAM CLI**
- Windows
  - Download the installer from the [AWS SAM CLI Download Page](https://aws.amazon.com/serverless/sam/).
  -  Run the installer and follow the on-screen instructions.
  - Add the installation path (usually `C:\Program Files\Amazon\AWSSAMCLI\bin`) to your `PATH` environment variable if not automatically configured.
- macOS
  - Install using Homebrew:
   ```bash
   brew install aws/tap/aws-sam-cli
   ```
3. **Build and Test API Gateway with Lambda**
To build the API Gateway and Lambda environment using SAM, run:

```bash
sam build --no-cached
sam local start-api --env-vars ./env.json --no-cached
```
**env.json for SAM CLI**
```json
{
  "<lambda-name-1>": {
    "ENV_FIRST": "...",
    "ENV_SECOND": "///"
  },
  "<lambda-name-2>": {
    "ENV_FIRST": "...",
    "ENV_SECOND": "///"
  }
}
```

The added warning ensures users understand that **environment variables** are **crucial** for the proper functioning of Lambda functions and must be specified correctly in the `env.json` file.

## Infra

**HCP Terraform** is integrated with a **VCS** (Version Control System) to provision and manage AWS resources through code. Using Infrastructure as Code (IaC) principles, all AWS resources are defined and versioned, ensuring consistency, repeatability, and ease of management.

### Demo

**WAF Rule & Slack Alarm Demo**  

- <https://youtu.be/S6AAgXVevEw?si=OiLR3wfE36uTpHYU>

**HCP Terraform Demo**  

- <https://youtu.be/zg9rhHcf8w0?si=A6rGs7k0rcp9nD0u>

### Architecture

![Architecture](https://github.com/vocaAppServerless/.github/blob/main/assets/img/architecture.png?raw=true)

### CI/CD - [Backend]

![Backend CI/CD](https://github.com/vocaAppServerless/.github/blob/main/assets/img/backend_ci_cd.png?raw=true)

### CI/CD - [Frontend]

![Frontend CI/CD](https://github.com/vocaAppServerless/.github/blob/main/assets/img/frontend_ci_cd.png?raw=true)

### Logging

- Leveraging CloudWatch Logs Subscription Filters to send log data to the ELK stack.
- Using the Kibana dashboard, you can monitor logs by log group, status, and more, gaining insights into application performance and issues.

![Logging Workflow](https://github.com/vocaAppServerless/.github/blob/main/assets/img/log_monitoring.png?raw=true)

![Kibana Dashboard](https://github.com/vocaAppServerless/.github/blob/main/assets/img/kibana_dashboard.png?raw=true)

### WAF Alarm

![WAF Alarm Workflow](https://github.com/vocaAppServerless/.github/blob/main/assets/img/waf_alarm_workflow.jpg?raw=true)

![WAF Alarm](https://github.com/vocaAppServerless/.github/blob/main/assets/img/waf_alarm.png?raw=true)

### Budget Alarm

![Budget Alarm Workflow](https://github.com/vocaAppServerless/.github/blob/main/assets/img/budget_alarm_workflow.jpg?raw=true)

![Budget Alarm](https://github.com/vocaAppServerless/.github/blob/main/assets/img/budgets_alarm.png?raw=true)
