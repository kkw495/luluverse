// AI 助手功能
import { db } from '../storage.js';

export class AIAssistant {
  constructor() {
    this.baseUrl = 'https://api.deepseek.com/v1/chat/completions';
  }

  getApiKey() {
    return localStorage.getItem('deepseek-api-key') || '';
  }

  async chat(messages, onChunk) {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      throw new Error('请先在设置中配置 DeepSeek API Key');
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        stream: true,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API 错误: ${response.status} ${await response.text()}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content || '';
            if (content) {
              accumulated += content;
              if (onChunk) onChunk(accumulated);
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    return accumulated;
  }

  // 总结笔记
  async summarizeNotes(notes) {
    const content = notes.map(n => `${n.title}\n${n.content || n.concept || n.core || ''}`).join('\n\n');
    
    const messages = [
      {
        role: 'system',
        content: '你是一个学习助手，帮助学生总结笔记。用简洁的要点形式总结，突出重点和关键概念。'
      },
      {
        role: 'user',
        content: `请总结以下笔记的核心内容：\n\n${content}`
      }
    ];

    return await this.chat(messages);
  }

  // 生成复习题
  async generateQuestions(topic, content) {
    const messages = [
      {
        role: 'system',
        content: '你是一个教学助手，根据学习内容生成复习题。生成3-5个由浅入深的问题，包括概念题、应用题和分析题。'
      },
      {
        role: 'user',
        content: `主题：${topic}\n\n内容：\n${content}\n\n请生成复习题。`
      }
    ];

    return await this.chat(messages);
  }

  // 解释概念
  async explainConcept(concept, context = '') {
    const messages = [
      {
        role: 'system',
        content: '你是一个耐心的老师，用通俗易懂的语言解释概念。先给定义，再举例，最后说明为什么重要。'
      },
      {
        role: 'user',
        content: context 
          ? `在以下背景下，请解释"${concept}"：\n${context}` 
          : `请解释"${concept}"`
      }
    ];

    return await this.chat(messages);
  }

  // 检查论证
  async checkArgument(argument) {
    const messages = [
      {
        role: 'system',
        content: '你是一个逻辑分析助手，帮助检查论证的严密性。指出逻辑漏洞、潜在反驳点、可以加强的地方。'
      },
      {
        role: 'user',
        content: `请分析这个论证：\n\n${argument}`
      }
    ];

    return await this.chat(messages);
  }

  // 头脑风暴
  async brainstorm(topic) {
    const messages = [
      {
        role: 'system',
        content: '你是一个创意助手，帮助用户从多个角度思考问题。提供5-7个不同视角或切入点。'
      },
      {
        role: 'user',
        content: `关于"${topic}"，请帮我从不同角度思考。`
      }
    ];

    return await this.chat(messages);
  }
}

// 导出单例
export const ai = new AIAssistant();
