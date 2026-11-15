
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const messages = $('messages');
  const input = $('input');
  const send = $('send');

  let history = [];
  let busy = false;

  function bubble(text, who) {
    const el = document.createElement('div');
    el.className = 'bubble ' + who;
    el.textContent = text;
    messages.append(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  async function ask(text) {
    if (busy) return;

    text = text.trim();
    if (!text) return;

    busy = true;
    send.disabled = true;
    input.disabled = true;

    bubble(text, 'user');
    history.push({ role: 'user', content: text });

    const pending = bubble('Thinking…', 'assistant');

    try {
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          messages: history.slice(-12)
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Something went wrong');
      }

      pending.textContent = payload.reply;

      history.push({
        role: 'assistant',
        content: payload.reply
      });

      if (history.length > 12) {
        history = history.slice(-12);
      }

    } catch (error) {
      pending.textContent = '⚠️ ' + error.message;
      history.pop();

    } finally {
      busy = false;
      send.disabled = false;
      input.disabled = false;
      input.focus();
      messages.scrollTop = messages.scrollHeight;
    }
  }

  $('form').addEventListener('submit', e => {
    e.preventDefault();

    const text = input.value;
    input.value = '';

    ask(text);
  });

  $('chips').addEventListener('click', e => {
    const btn = e.target.closest('[data-question]');

    if (btn) {
      ask(btn.dataset.question);
    }
  });

  $('reset').addEventListener('click', () => {
    history = [];
    messages.replaceChildren();

    bubble(
      'မင်္ဂလာပါ 👋 ဘာအကြောင်းစုံစမ်းချင်ပါသလဲ?',
      'assistant'
    );
  });
})();
