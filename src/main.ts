window.addEventListener('DOMContentLoaded', () => {
    function initElliottAIChat() {
        const form = document.getElementById('elliott-ai-form');
        const input = document.getElementById('elliott-ai-input') as HTMLInputElement;
        const exampleQuestions = document.querySelectorAll('#ai-example-questions button') as NodeListOf<HTMLButtonElement>
        const log = document.getElementById('elliott-ai-log');
        const submit = document.getElementById('elliott-ai-submit') as HTMLFormElement;

        type Role = 'assistant' | 'user';

        if (!form || !input || !log || !submit) {
            return;
        }

        const decoder = new TextDecoder();

        const scrollToBottom = () => {
            log.scrollTop = log.scrollHeight;
        };

        const appendMessage = (role: Role, text = '') => {
            const wrapper = document.createElement('div');
            wrapper.className = `chat-message ${role}`;
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            bubble.textContent = text;
            if (role === 'assistant') {
                const loadingSpan = document.createElement('span');
                loadingSpan.className = 'loading';
                loadingSpan.textContent = 'Thinking';
                bubble.appendChild(loadingSpan);
            }
            wrapper.appendChild(bubble);
            log.appendChild(wrapper);
            scrollToBottom();
            return bubble;
        };

        const setLoading = (isLoading: boolean) => {
            submit.disabled = isLoading;
            input.disabled = isLoading;
            submit.textContent = isLoading ? 'Thinking…' : 'Ask';
        };

        async function streamQuestion(question: string) {
            const assistantBubble = appendMessage('assistant', '');
            let answer = '';
            let buffer: string | undefined = '';

            try {
                const response = await fetch('/.netlify/functions/elliott-ai', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ question }),
                });

                if (!response.ok || !response.body) {
                    throw new Error(`Request failed (${response.status})`);
                }

                const reader = response.body.getReader();
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const events: string[] | undefined | '' = buffer && buffer.split('\n\n');
                    if (!events) continue;
                    buffer = events.pop();
                    for (const raw of events) {
                        const line = raw.trim();
                        if (!line.startsWith('data:')) continue;
                        const payload = line.replace(/^data:\s*/, '');
                        if (!payload) continue;
                        let parsed;
                        try {
                            parsed = JSON.parse(payload);
                        } catch (err) {
                            continue;
                        }

                        if (parsed.type === 'token') {
                            answer += parsed.token;
                            assistantBubble.textContent = answer;
                            scrollToBottom();
                        } else if (parsed.type === 'error') {
                            throw new Error(parsed.message || 'Unknown error');
                        }
                    }
                }
            } catch (err) {
                if (err instanceof Error) {
                    assistantBubble.textContent = `Sorry, something went wrong: ${err.message}`;
                } else {
                    assistantBubble.textContent = 'Sorry, something went wrong.';
                }
            } finally {
                setLoading(false);
            }
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const question = input.value.trim();
            if (!question) return;

            appendMessage('user', question);
            input.value = '';
            setLoading(true);
            streamQuestion(question);
        });
        exampleQuestions.forEach(questionEl => {
            const question = questionEl?.dataset?.question;
            if (!question) return;

            questionEl.addEventListener('click', () => {
                appendMessage('user', question);
                setLoading(true);
                streamQuestion(question);
            });
        });
    };
    initElliottAIChat();
})