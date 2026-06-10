// AI 助手面板
import { db } from '../storage.js';
import { ai } from './ai.js';

export async function initAIPanel(container) {
  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">🤖 AI 助手</h1>
        <p class="page-subtitle">用 AI 帮你总结、出题、解释、分析</p>
      </div>

      <!-- AI 工具卡片 -->
      <div class="grid grid-2">
        <div class="card" style="cursor: pointer;" onclick="showAITool('summarize')">
          <h3>📝 总结笔记</h3>
          <p class="muted">选择笔记，AI 帮你提炼核心要点</p>
        </div>

        <div class="card" style="cursor: pointer;" onclick="showAITool('quiz')">
          <h3>❓ 生成复习题</h3>
          <p class="muted">根据学习内容自动生成复习题</p>
        </div>

        <div class="card" style="cursor: pointer;" onclick="showAITool('explain')">
          <h3>💡 解释概念</h3>
          <p class="muted">输入概念，AI 用通俗语言解释</p>
        </div>

        <div class="card" style="cursor: pointer;" onclick="showAITool('check')">
          <h3>✅ 检查论证</h3>
          <p class="muted">分析论证的逻辑严密性</p>
        </div>

        <div class="card" style="cursor: pointer;" onclick="showAITool('brainstorm')">
          <h3>🌟 头脑风暴</h3>
          <p class="muted">从多个角度思考问题</p>
        </div>

        <div class="card" style="cursor: pointer;" onclick="showAIChat()">
          <h3>💬 自由对话</h3>
          <p class="muted">和 AI 自由交流讨论</p>
        </div>
      </div>

      <!-- AI 对话区 -->
      <div id="aiWorkspace" style="display: none; margin-top: 28px;">
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 id="aiWorkspaceTitle">AI 助手</h3>
            <button class="btn-secondary" onclick="closeAIWorkspace()">关闭</button>
          </div>
          
          <div id="aiInput"></div>
          
          <div id="aiOutput" style="margin-top: 14px; min-height: 200px; max-height: 500px; overflow-y: auto; padding: 16px; background: #f6f3ed; border-radius: 12px; display: none;">
            <div id="aiOutputContent" style="line-height: 1.8; white-space: pre-wrap;"></div>
          </div>

          <div style="margin-top: 14px; display: flex; gap: 10px;">
            <button id="aiSubmitBtn" class="btn-primary" onclick="submitAITask()">生成</button>
            <button class="btn-secondary" onclick="saveAIResult()">保存到笔记</button>
          </div>
        </div>
      </div>
    </div>
  `;

  let currentTool = null;
  let currentResult = '';

  window.showAITool = (tool) => {
    currentTool = tool;
    const workspace = document.getElementById('aiWorkspace');
    const title = document.getElementById('aiWorkspaceTitle');
    const input = document.getElementById('aiInput');
    const output = document.getElementById('aiOutput');
    
    workspace.style.display = 'block';
    output.style.display = 'none';
    
    switch(tool) {
      case 'summarize':
        title.textContent = '📝 总结笔记';
        input.innerHTML = `
          <select id="aiSourceType" class="select-input" style="width: 100%; padding: 12px; border: 1px solid var(--line); border-radius: 12px; margin-bottom: 10px;">
            <option value="">选择笔记来源</option>
            <option value="classNotes">课堂笔记</option>
            <option value="lawNotes">法学笔记</option>
            <option value="worldKnowledge">知识卡片</option>
          </select>
          <div id="aiNotesList"></div>
        `;
        
        document.getElementById('aiSourceType').addEventListener('change', async (e) => {
          const type = e.target.value;
          if (!type) return;
          
          const notes = await db.getAll(type);
          const listHtml = notes.slice(0, 10).map(n => `
            <label style="display: block; padding: 10px; background: white; border: 1px solid var(--line); border-radius: 10px; margin-bottom: 8px; cursor: pointer;">
              <input type="checkbox" value="${n.id}" style="margin-right: 8px;">
              ${n.title || n.name || '未命名'}
            </label>
          `).join('');
          
          document.getElementById('aiNotesList').innerHTML = listHtml || '<p style="color: var(--sub);">没有笔记</p>';
        });
        break;

      case 'quiz':
        title.textContent = '❓ 生成复习题';
        input.innerHTML = `
          <input type="text" id="aiQuizTopic" placeholder="主题，如：民事诉讼法 - 管辖" style="width: 100%; padding: 12px; border: 1px solid var(--line); border-radius: 12px; margin-bottom: 10px;">
          <textarea id="aiQuizContent" placeholder="输入学习内容..." style="width: 100%; min-height: 150px; padding: 12px; border: 1px solid var(--line); border-radius: 12px;"></textarea>
        `;
        break;

      case 'explain':
        title.textContent = '💡 解释概念';
        input.innerHTML = `
          <input type="text" id="aiConcept" placeholder="输入要解释的概念" style="width: 100%; padding: 12px; border: 1px solid var(--line); border-radius: 12px; margin-bottom: 10px;">
          <textarea id="aiContext" placeholder="背景（可选）" style="width: 100%; min-height: 80px; padding: 12px; border: 1px solid var(--line); border-radius: 12px;"></textarea>
        `;
        break;

      case 'check':
        title.textContent = '✅ 检查论证';
        input.innerHTML = `
          <textarea id="aiArgument" placeholder="输入你的论证..." style="width: 100%; min-height: 150px; padding: 12px; border: 1px solid var(--line); border-radius: 12px;"></textarea>
        `;
        break;

      case 'brainstorm':
        title.textContent = '🌟 头脑风暴';
        input.innerHTML = `
          <input type="text" id="aiBrainstormTopic" placeholder="输入要思考的问题" style="width: 100%; padding: 12px; border: 1px solid var(--line); border-radius: 12px;">
        `;
        break;
    }

    workspace.scrollIntoView({ behavior: 'smooth' });
  };

  window.showAIChat = () => {
    const workspace = document.getElementById('aiWorkspace');
    const title = document.getElementById('aiWorkspaceTitle');
    const input = document.getElementById('aiInput');
    const output = document.getElementById('aiOutput');
    
    currentTool = 'chat';
    workspace.style.display = 'block';
    output.style.display = 'block';
    
    title.textContent = '💬 自由对话';
    
    input.innerHTML = `
      <div id="chatHistory" style="max-height: 300px; overflow-y: auto; margin-bottom: 14px; padding: 12px; background: white; border: 1px solid var(--line); border-radius: 12px;"></div>
      <div style="display: flex; gap: 10px;">
        <textarea id="chatInput" placeholder="输入消息..." style="flex: 1; min-height: 60px; padding: 12px; border: 1px solid var(--line); border-radius: 12px; resize: none;"></textarea>
        <button class="btn-primary" onclick="sendChatMessage()" style="align-self: flex-end;">发送</button>
      </div>
    `;
    
    document.getElementById('aiOutput').style.display = 'none';
    document.getElementById('aiSubmitBtn').style.display = 'none';
    
    // 初始化对话历史
    if (!window.chatMessages) {
      window.chatMessages = [];
    }
    
    renderChatHistory();
    workspace.scrollIntoView({ behavior: 'smooth' });
  };
  
  window.sendChatMessage = async () => {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // 添加用户消息
    window.chatMessages.push({ role: 'user', content: message });
    chatInput.value = '';
    renderChatHistory();
    
    // 添加 AI 响应占位
    const aiIndex = window.chatMessages.length;
    window.chatMessages.push({ role: 'assistant', content: '思考中...' });
    renderChatHistory();
    
    try {
      // 调用 AI
      const messages = [
        {
          role: 'system',
          content: '你是一个有帮助的学习助手，可以回答各种问题、讨论想法、帮助思考。用友好、清晰的语言交流。'
        },
        ...window.chatMessages.slice(0, -1) // 不包括占位消息
      ];
      
      let response = '';
      await ai.chat(messages, (content) => {
        response = content;
        window.chatMessages[aiIndex].content = content;
        renderChatHistory();
      });
      
    } catch (err) {
      window.chatMessages[aiIndex].content = '错误：' + err.message;
      renderChatHistory();
    }
  };
  
  function renderChatHistory() {
    const history = document.getElementById('chatHistory');
    if (!history) return;
    
    history.innerHTML = window.chatMessages.map(msg => `
      <div style="margin-bottom: 12px; ${msg.role === 'user' ? 'text-align: right;' : ''}">
        <div style="display: inline-block; max-width: 80%; padding: 10px 14px; border-radius: 12px; ${
          msg.role === 'user' 
            ? 'background: var(--sage); color: #223126;' 
            : 'background: #f6f3ed; text-align: left;'
        }">
          <div style="font-size: 11px; color: var(--sub); margin-bottom: 4px;">${msg.role === 'user' ? '我' : 'AI'}</div>
          <div style="line-height: 1.7; white-space: pre-wrap;">${msg.content}</div>
        </div>
      </div>
    `).join('');
    
    history.scrollTop = history.scrollHeight;
  }
  
  // 回车发送
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey && document.getElementById('chatInput') === document.activeElement) {
      sendChatMessage();
    }
  });
  

  window.closeAIWorkspace = () => {
    document.getElementById('aiWorkspace').style.display = 'none';
    currentTool = null;
  };

  window.submitAITask = async () => {
    const output = document.getElementById('aiOutput');
    const outputContent = document.getElementById('aiOutputContent');
    const submitBtn = document.getElementById('aiSubmitBtn');
    
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = '生成中...';
      output.style.display = 'block';
      outputContent.textContent = '';

      let result = '';

      switch(currentTool) {
        case 'summarize':
          const selectedIds = Array.from(document.querySelectorAll('#aiNotesList input:checked')).map(el => parseInt(el.value));
          if (selectedIds.length === 0) {
            alert('请选择要总结的笔记');
            return;
          }
          
          const sourceType = document.getElementById('aiSourceType').value;
          const allNotes = await db.getAll(sourceType);
          const selectedNotes = allNotes.filter(n => selectedIds.includes(n.id));
          
          result = await ai.summarizeNotes(selectedNotes);
          break;

        case 'quiz':
          const topic = document.getElementById('aiQuizTopic').value.trim();
          const content = document.getElementById('aiQuizContent').value.trim();
          if (!topic || !content) {
            alert('请填写主题和内容');
            return;
          }
          result = await ai.generateQuestions(topic, content);
          break;

        case 'explain':
          const concept = document.getElementById('aiConcept').value.trim();
          if (!concept) {
            alert('请输入要解释的概念');
            return;
          }
          const context = document.getElementById('aiContext').value.trim();
          result = await ai.explainConcept(concept, context);
          break;

        case 'check':
          const argument = document.getElementById('aiArgument').value.trim();
          if (!argument) {
            alert('请输入论证内容');
            return;
          }
          result = await ai.checkArgument(argument);
          break;

        case 'brainstorm':
          const brainstormTopic = document.getElementById('aiBrainstormTopic').value.trim();
          if (!brainstormTopic) {
            alert('请输入要思考的问题');
            return;
          }
          result = await ai.brainstorm(brainstormTopic);
          break;
      }

      currentResult = result;
      outputContent.textContent = result;

    } catch (err) {
      outputContent.textContent = '错误：' + err.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '生成';
    }
  };

  window.saveAIResult = async () => {
    if (!currentResult) {
      alert('还没有生成结果');
      return;
    }

    const title = prompt('保存为笔记，输入标题：');
    if (!title) return;

    await db.add('notes', {
      title: title.trim(),
      content: currentResult,
      source: 'AI 生成'
    });

    alert('✅ 已保存到笔记');
  };
}
