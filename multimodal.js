
        // Debug Terminal Functionality
        const debugTerminal = document.getElementById('debugTerminal');
        const debugContent = document.getElementById('debugContent');
        let debugVisible = false;

        // Override console methods to capture logs
        const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
        };

        function addDebugLog(message, type = 'log') {
            const timestamp = new Date().toLocaleTimeString();
            const logElement = document.createElement('div');
            logElement.className = `debug-log ${type}`;
            logElement.innerHTML = `<span class="debug-timestamp">[${timestamp}]</span> ${message}`;
            debugContent.appendChild(logElement);
            debugContent.scrollTop = debugContent.scrollHeight;
        }

        // Override console methods
        console.log = function(...args) {
            originalConsole.log.apply(console, args);
            addDebugLog(args.join(' '), 'log');
        };

        console.error = function(...args) {
            originalConsole.error.apply(console, args);
            addDebugLog(args.join(' '), 'error');
        };

        console.warn = function(...args) {
            originalConsole.warn.apply(console, args);
            addDebugLog(args.join(' '), 'warn');
        };

        console.info = function(...args) {
            originalConsole.info.apply(console, args);
            addDebugLog(args.join(' '), 'info');
        };

        function toggleDebug() {
            debugVisible = !debugVisible;
            debugTerminal.classList.toggle('hidden', !debugVisible);
        }

        function clearDebugLog() {
            debugContent.innerHTML = '';
        }

        // Initialize debug with welcome message
        addDebugLog('Debug terminal initialized', 'info');

        // DOM Elements
        const createMode = document.getElementById('createMode');
        const generationMode = document.getElementById('generationMode');
        const resultsMode = document.getElementById('resultsMode');
        const decodeMode = document.getElementById('decodeMode');
        
        const mainTextarea = document.getElementById('mainTextarea');
        const mediaMode = document.getElementById('mediaMode');
        const mediaPreview = document.getElementById('mediaPreview');
        const clearMediaBtn = document.getElementById('clearMediaBtn');
        const regenerateBtn = document.getElementById('regenerateBtn');
        
        // New media control buttons
        const cameraBtn = document.getElementById('cameraBtn');
        const recordBtnTop = document.getElementById('recordBtnTop');
        const generateBtn = document.getElementById('generateBtn');
        
        const emojiPreview = document.getElementById('emojiPreview');
        const shareArea = document.getElementById('shareArea');
        const shareLink = document.getElementById('shareLink');
        const copyBtn = document.getElementById('copyBtn');
        const newChallengeBtn = document.getElementById('newChallengeBtn');
        
        const emojiDisplay = document.getElementById('emojiDisplay');
        const guessInput = document.getElementById('guessInput');
        const submitGuessBtn = document.getElementById('submitGuessBtn');
        const resultMsg = document.getElementById('resultMsg');
        const revealBtn = document.getElementById('revealBtn');
        const answerArea = document.getElementById('answerArea');
        const playAgainBtn = document.getElementById('playAgainBtn');

        // Scoring and clue elements
        const scoreDisplay = document.getElementById('scoreDisplay');
        const currentScore = document.getElementById('currentScore');
        const attemptsCount = document.getElementById('attemptsCount');
        const clueArea = document.getElementById('clueArea');
        const revealSection = document.getElementById('revealSection');
        const revealCounter = document.getElementById('revealCounter');
        const countdownText = document.getElementById('countdownText');

        // State
        let currentMedia = null;
        let mediaRecorder = null;
        let audioChunks = [];
        let currentOriginalText = '';
        let isRecording = false;

        // Scoring system
        let playerScore = 100;
        let attempts = 0;
        const maxRevealAttempts = 3;
        let cluesGiven = [];

        // Camera functionality
        async function capturePhoto() {
            try {
                console.log('📷 Starting camera capture...');
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    } 
                });
                
                // Create video element
                const video = document.createElement('video');
                video.srcObject = stream;
                video.autoplay = true;
                video.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 10000;
                    border-radius: 12px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    max-width: 90vw;
                    max-height: 90vh;
                `;
                
                // Create overlay
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: end;
                    flex-direction: column;
                    gap: 20px;
                `;
                
                // Create capture button
                const captureButton = document.createElement('button');
                captureButton.textContent = '📸 Capture Photo';
                captureButton.style.cssText = `
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    border: none;
                    padding: 16px 32px;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                `;
                
                // Create cancel button
                const cancelButton = document.createElement('button');
                cancelButton.textContent = '❌ Cancel';
                cancelButton.style.cssText = `
                    background: #6b7280;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                `;
                
                overlay.appendChild(video);
                overlay.appendChild(captureButton);
                overlay.appendChild(cancelButton);
                document.body.appendChild(overlay);
                
                // Wait for video to load
                await new Promise((resolve) => {
                    video.addEventListener('loadedmetadata', resolve);
                });
                
                return new Promise((resolve, reject) => {
                    captureButton.addEventListener('click', () => {
                        // Create canvas to capture frame
                        const canvas = document.createElement('canvas');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(video, 0, 0);
                        
                        console.log('📸 Canvas created, size:', canvas.width, 'x', canvas.height);
                        
                        // Convert to blob
                        canvas.toBlob((blob) => {
                            console.log('📸 Blob created:', blob ? blob.size + ' bytes' : 'null');
                            
                            // Stop camera
                            stream.getTracks().forEach(track => track.stop());
                            document.body.removeChild(overlay);
                            
                            if (blob) {
                                console.log('📸 Calling handleImageFile with blob...');
                                handleImageFile(blob);
                                console.log('✅ Photo captured successfully');
                                resolve();
                            } else {
                                console.error('❌ Failed to create blob from canvas');
                                reject(new Error('Failed to capture photo'));
                            }
                        }, 'image/jpeg', 0.8);
                    });
                    
                    cancelButton.addEventListener('click', () => {
                        stream.getTracks().forEach(track => track.stop());
                        document.body.removeChild(overlay);
                        console.log('📷 Camera capture cancelled');
                        resolve();
                    });
                });
                
            } catch (error) {
                console.error('❌ Camera error:', error);
                alert('Could not access camera. Please check permissions.');
            }
        }

        // Audio recording functionality
        async function toggleRecordingFixed() {
            if (!isRecording) {
                try {
                    console.log('🎤 Starting audio recording...');
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorder = new MediaRecorder(stream);
                    audioChunks = [];

                    mediaRecorder.ondataavailable = (event) => {
                        audioChunks.push(event.data);
                    };

                    mediaRecorder.onstop = () => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                        currentMedia = { type: 'audio', blob: audioBlob };
                        
                        const audioUrl = URL.createObjectURL(audioBlob);
                        mediaPreview.innerHTML = `<audio controls class="media-preview"><source src="${audioUrl}" type="audio/wav"></audio>`;
                        mediaMode.classList.remove('hidden');
                        mainTextarea.placeholder = "Audio recorded! Add text or generate emojis from the audio.";
                        
                        stream.getTracks().forEach(track => track.stop());
                        updateGenerateButton();
                        console.log('✅ Audio recording completed');
                    };

                    mediaRecorder.start();
                    isRecording = true;
                    recordBtnTop.classList.add('recording');
                    recordBtnTop.title = 'Stop Recording';
                    
                } catch (error) {
                    console.error('❌ Microphone error:', error);
                    alert('Could not access microphone. Please check permissions.');
                }
            } else {
                if (mediaRecorder && mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                    isRecording = false;
                    recordBtnTop.classList.remove('recording');
                    recordBtnTop.title = 'Record Audio';
                }
            }
        }

        // Event listeners for new media buttons
        cameraBtn.addEventListener('click', capturePhoto);
        recordBtnTop.addEventListener('click', toggleRecordingFixed);

        // Clue generation based on text analysis
        function generateClue(text, attemptNumber) {
            const words = text.toLowerCase().split(' ');
            const clues = [];
            
            // Different clue strategies based on attempt
            if (attemptNumber === 1) {
                // First clue: word count and length
                clues.push(`This phrase has ${words.length} word${words.length > 1 ? 's' : ''}`);
                if (words.length > 0) {
                    clues.push(`The first word has ${words[0].length} letters`);
                }
            } else if (attemptNumber === 2) {
                // Second clue: category or theme
                const themes = {
                    birthday: ['birthday', 'party', 'cake', 'celebration'],
                    food: ['pizza', 'burger', 'food', 'eat', 'dinner'],
                    travel: ['vacation', 'trip', 'travel', 'plane', 'hotel'],
                    work: ['work', 'job', 'office', 'meeting', 'boss'],
                    love: ['love', 'date', 'wedding', 'heart', 'romance']
                };
                
                for (const [theme, keywords] of Object.entries(themes)) {
                    if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
                        clues.push(`This is about ${theme}`);
                        break;
                    }
                }
                
                if (clues.length === 0) {
                    // Fallback: first letter
                    clues.push(`It starts with the letter "${text.charAt(0).toUpperCase()}"`);
                }
            } else {
                // Third clue: more specific
                if (words.length > 1) {
                    clues.push(`The last word is "${words[words.length - 1]}"`);
                } else {
                    clues.push(`It rhymes with "${generateRhyme(text)}"`);
                }
            }
            
            return clues[0] || "This is a common phrase";
        }

        // Chrome AI-powered clue generation
        async function generateClue(text, attemptNumber) {
            try {
                console.log(`💡 Generating AI clue for attempt ${attemptNumber}: "${text}"`);
                
                const languageModelAPI = getLanguageModelAPI();
                if (!languageModelAPI) {
                    console.warn('Chrome AI not available for clue generation, using fallback');
                    return generateFallbackClue(text, attemptNumber);
                }

                // Create AI session for clue generation
                const clueSession = await languageModelAPI.create({
                    initialPrompts: [{
                        role: "system",
                        content: `You are a helpful game master creating clues for a word guessing game. 
Current attempt number: ${attemptNumber}
Current text: ${text}

Generate ONE helpful clue based on the attempt number:

Attempt 1: Give a general category or theme hint (e.g., "This is about food" or "This relates to celebrations")
Attempt 2: Give a more specific hint about structure or content (e.g., "This has 2 words" or "It starts with 'B'")  
Attempt 3: Give a very specific hint that almost gives it away (e.g., "The last word rhymes with 'cake'" or "It's something you do on birthdays")

Rules:
- Keep clues under 15 words
- Don't reveal the exact answer
- Be encouraging and helpful
- Make it progressively easier with each attempt`
                    }]
                });

                const cluePrompt = `Generate a clue for attempt ${attemptNumber} for the phrase: "${text}"`;
                const aiClue = await clueSession.prompt(cluePrompt);
                clueSession.destroy();

                // Clean up the AI response
                const cleanClue = aiClue.trim().replace(/^["']|["']$/g, '');
                
                console.log(`✅ AI generated clue: "${cleanClue}"`);
                return cleanClue;

            } catch (error) {
                console.error('❌ Error generating AI clue:', error);
                console.log('Falling back to hardcoded clues');
                return generateFallbackClue(text, attemptNumber);
            }
        }

        // Fallback clue generation (original logic)
        function generateFallbackClue(text, attemptNumber) {
            const words = text.toLowerCase().split(' ');
            const clues = [];
            
            // Different clue strategies based on attempt
            if (attemptNumber === 1) {
                // First clue: word count and length
                clues.push(`This phrase has ${words.length} word${words.length > 1 ? 's' : ''}`);
                if (words.length > 0) {
                    clues.push(`The first word has ${words[0].length} letters`);
                }
            } else if (attemptNumber === 2) {
                // Second clue: category or theme
                const themes = {
                    birthday: ['birthday', 'party', 'cake', 'celebration'],
                    food: ['pizza', 'burger', 'food', 'eat', 'dinner'],
                    travel: ['vacation', 'trip', 'travel', 'plane', 'hotel'],
                    work: ['work', 'job', 'office', 'meeting', 'boss'],
                    love: ['love', 'date', 'wedding', 'heart', 'romance']
                };
                
                for (const [theme, keywords] of Object.entries(themes)) {
                    if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
                        clues.push(`This is about ${theme}`);
                        break;
                    }
                }
                
                if (clues.length === 0) {
                    // Fallback: first letter
                    clues.push(`It starts with the letter "${text.charAt(0).toUpperCase()}"`);
                }
            } else {
                // Third clue: more specific
                if (words.length > 1) {
                    clues.push(`The last word is "${words[words.length - 1]}"`);
                } else {
                    clues.push(`It rhymes with "${generateRhyme(text)}"`);
                }
            }
            
            return clues[0] || "This is a common phrase";
        }

        function generateRhyme(text) {
            const rhymes = {
                'party': 'hearty',
                'cake': 'bake',
                'love': 'dove',
                'fun': 'sun',
                'happy': 'snappy'
            };
            
            const words = text.toLowerCase().split(' ');
            for (const word of words) {
                if (rhymes[word]) {
                    return rhymes[word];
                }
            }
            return 'play';
        }

        function updateScore(correct = false) {
            if (correct) {
                // Bonus points for fewer attempts
                let bonus = Math.max(0, (maxRevealAttempts - attempts) * 20);
                console.log(`🏆 Correct! Base score: ${playerScore}, Bonus: ${bonus}`);
            } else {
                // Deduct points for wrong answer
                playerScore = Math.max(0, playerScore - 15);
                console.log(`❌ Wrong answer! Score reduced to: ${playerScore}`);
            }
            
            currentScore.textContent = playerScore;
            attemptsCount.textContent = attempts;
        }

        async function showClue() {
            try {
                // Show loading state
                clueArea.textContent = '🤔 Thinking of a helpful clue...';
                clueArea.classList.remove('hidden');
                
                // Generate AI-powered clue
                const clue = await generateClue(currentOriginalText, attempts);
                
                // Show the clue
                clueArea.textContent = clue;
                cluesGiven.push(clue);
                console.log(`💡 AI Clue given: ${clue}`);
                
            } catch (error) {
                console.error('❌ Error showing clue:', error);
                // Fallback to simple clue
                const fallbackClue = generateFallbackClue(currentOriginalText, attempts);
                clueArea.textContent = fallbackClue;
                cluesGiven.push(fallbackClue);
                console.log(`💡 Fallback clue given: ${fallbackClue}`);
            }
        }

        function updateRevealButton() {
            const remaining = maxRevealAttempts - attempts;
            if (remaining <= 0) {
                revealBtn.disabled = false;
                revealBtn.textContent = 'Reveal Answer';
                countdownText.textContent = '0';
                revealCounter.innerHTML = 'Reveal now available!';
            } else {
                countdownText.textContent = remaining;
                revealCounter.innerHTML = `Reveal available in <span id="countdownText">${remaining}</span> attempts`;
            }
        }

        function resetGame() {
            playerScore = 100;
            attempts = 0;
            cluesGiven = [];
            // Update display without deducting points
            currentScore.textContent = playerScore;
            attemptsCount.textContent = attempts;
            updateRevealButton();
            clueArea.classList.add('hidden');
            revealSection.classList.remove('hidden');
        }

        // Show only one mode
        function showMode(mode) {
            [createMode, generationMode, resultsMode, decodeMode].forEach(el => {
                el.classList.add('hidden');
            });
            mode.classList.remove('hidden');
        }

        // Helper function to get the LanguageModel API
        function getLanguageModelAPI() {
            try {
                if (window.ai && window.ai.languageModel) {
                    return window.ai.languageModel;
                }
            } catch (e) {
                console.log('window.ai not accessible:', e.message);
            }
            
            try {
                if (window.LanguageModel) {
                    return window.LanguageModel;
                }
            } catch (e) {
                console.log('window.LanguageModel not accessible:', e.message);
            }
            
            try {
                if (typeof LanguageModel !== 'undefined') {
                    return LanguageModel;
                }
            } catch (e) {
                console.log('global LanguageModel not accessible:', e.message);
            }
            
            return null;
        }

        // Handle image file
        function handleImageFile(file) {
            console.log('📸 handleImageFile called with:', file);
            currentMedia = { type: 'image', blob: file };
            
            const reader = new FileReader();
            reader.onload = (e) => {
                console.log('📸 FileReader loaded, creating preview...');
                mediaPreview.innerHTML = `<img src="${e.target.result}" class="media-preview" alt="Uploaded image">`;
                mediaMode.classList.remove('hidden');
                mainTextarea.placeholder = "Image uploaded! Add text or generate emojis from the image.";
                updateGenerateButton();
                console.log('📸 Image preview created successfully');
            };
            reader.onerror = (e) => {
                console.error('📸 FileReader error:', e);
            };
            reader.readAsDataURL(file);
        }

        // Initialize
        handleURL();
        updateGenerateButton();
        
        // Check Chrome AI availability on startup and show helpful message
        setTimeout(async () => {
            const aiStatus = await checkChromeAIAvailability();
            if (!aiStatus.available) {
                console.warn('Chrome AI not available:', aiStatus.reason);
                
                // Show a helpful message in the app header
                const helpMessage = document.createElement('div');
                helpMessage.style.cssText = `
                    background: #fef3cd;
                    border: 1px solid #ffeeba;
                    color: #856404;
                    padding: 12px;
                    border-radius: 8px;
                    margin: 16px 0;
                    font-size: 0.9rem;
                `;
                helpMessage.innerHTML = `
                    <strong>⚠️ Chrome AI Required:</strong> This app needs Chrome AI to work. 
                    Click the <strong>?</strong> button for setup instructions.
                `;
                
                document.querySelector('.app-header').appendChild(helpMessage);
            }
        }, 100);

        // Add missing event listeners and functionality
        
        // Drag & Drop for images
        mainTextarea.addEventListener('dragover', (e) => {
            e.preventDefault();
            mainTextarea.classList.add('drag-over');
        });

        mainTextarea.addEventListener('dragleave', () => {
            mainTextarea.classList.remove('drag-over');
        });

        mainTextarea.addEventListener('drop', (e) => {
            e.preventDefault();
            mainTextarea.classList.remove('drag-over');
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleImageFile(file);
            }
        });

        // Text input listener
        mainTextarea.addEventListener('input', updateGenerateButton);

        // Keyboard shortcut
        mainTextarea.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!generateBtn.disabled) {
                    generateBtn.click();
                }
            }
        });

        // Clear media button
        clearMediaBtn.addEventListener('click', () => {
            console.log('🗑️ Clearing media...');
            currentMedia = null;
            mediaMode.classList.add('hidden');
            mainTextarea.placeholder = "Type your story, drag an image here, or use the camera/microphone buttons above...";
            mainTextarea.value = '';
            updateGenerateButton();
            console.log('✅ Media cleared');
        });

        // Chrome AI availability check
        async function checkChromeAIAvailability() {
            try {
                // First check if any API exists at all
                let languageModelAPI = getLanguageModelAPI();
                
                if (!languageModelAPI) {
                    console.log('No LanguageModel API found');
                    return { available: false, reason: 'API not available - Chrome AI not supported in this version' };
                }

                // Check if the availability method exists
                if (typeof languageModelAPI.availability !== 'function') {
                    console.log('LanguageModel.availability method not found');
                    return { available: false, reason: 'Availability check not supported' };
                }

                let availability;
                try {
                    // Try to check availability - this might fail in older versions
                    availability = await languageModelAPI.availability({
                        expectedInputs: [
                            { type: 'text' },
                            { type: 'image' },
                            { type: 'audio' }
                        ]
                    });
                    console.log('Chrome AI availability:', availability);
                } catch (availabilityError) {
                    console.error('Error calling availability():', availabilityError);
                    
                    // Try basic availability check without options
                    try {
                        availability = await languageModelAPI.availability();
                        console.log('Chrome AI basic availability:', availability);
                    } catch (basicError) {
                        console.error('Basic availability check failed:', basicError);
                        return { available: false, reason: `Availability check failed: ${basicError.message}` };
                    }
                }
                
                return { 
                    available: availability !== 'unavailable', 
                    status: availability,
                    reason: availability === 'unavailable' ? 'Model not supported on this device' : null
                };
            } catch (error) {
                console.error('Error in checkChromeAIAvailability:', error);
                return { available: false, reason: `Chrome AI error: ${error.message}` };
            }
        }

        // Update generate button state based on AI availability
        async function updateGenerateButtonWithAI() {
            const hasText = mainTextarea.value.trim().length > 0;
            const hasMedia = currentMedia !== null;
            const hasContent = hasText || hasMedia;
            
            if (!hasContent) {
                generateBtn.disabled = true;
                generateBtn.textContent = 'Generate Emoji Challenge';
                return;
            }

            const aiStatus = await checkChromeAIAvailability();
            
            if (!aiStatus.available) {
                generateBtn.disabled = true;
                generateBtn.textContent = 'Chrome AI Not Available';
                generateBtn.title = `${aiStatus.reason}. Please use Chrome Canary with Prompt API enabled.`;
            } else if (aiStatus.status === 'downloading') {
                generateBtn.disabled = true;
                generateBtn.textContent = 'Downloading AI Model...';
                generateBtn.title = 'Please wait while the AI model downloads';
            } else if (aiStatus.status === 'downloadable') {
                generateBtn.disabled = false;
                generateBtn.textContent = 'Generate (Will Download AI Model)';
                generateBtn.title = 'This will download the AI model first';
            } else {
                generateBtn.disabled = false;
                generateBtn.textContent = 'Generate Emoji Challenge';
                generateBtn.title = '';
            }
        }

        // Update the original updateGenerateButton function
        function updateGenerateButton() {
            updateGenerateButtonWithAI();
        }

        // Generate button - RESTORE THE FULL CHROME AI FUNCTIONALITY
        generateBtn.addEventListener('click', async () => {
            console.log('🚀 Generate button clicked');
            console.log('Current media:', currentMedia);
            console.log('Text content:', mainTextarea.value.trim());
            
            showMode(generationMode);
            
            try {
                // Check if Chrome AI is available
                const languageModelAPI = getLanguageModelAPI();
                if (!languageModelAPI) {
                    throw new Error('Chrome AI is not available. Please use Chrome Canary with Prompt API enabled.');
                }

                const text = mainTextarea.value.trim();
                let emojis;
                
                console.log('Starting emoji generation with Chrome AI...');
                
                // Create AI session based on input type
                let session;
                let prompt;

                if (currentMedia?.type === 'image') {
                    // For images, we need multimodal support
                    session = await languageModelAPI.create({
                        expectedInputs: [
                            { type: "text" },
                            { type: "image" }
                        ],
                        initialPrompts: [{
                            role: "system",
                            content: "You are an expert at describing images in simple, clear text. Describe what you see in 2-6 words that capture the main subject or action."
                        }],
                        monitor(m) {
                            m.addEventListener("downloadprogress", e => {
                                const percent = Math.round(e.loaded * 100);
                                console.log(`Download progress: ${percent}%`);
                                document.querySelector('.generation-mode h2').textContent = 
                                    `Downloading AI model... ${percent}%`;
                            });
                        }
                    });

                    // Create image element for the AI
                    const imageUrl = URL.createObjectURL(currentMedia.blob);
                    const img = new Image();
                    img.src = imageUrl;
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                    });

                    // First get a text description
                    const descriptionPrompt = [{
                        role: "user",
                        content: [
                            { type: "text", value: text || "Describe what you see in this image in 2-6 simple words:" },
                            { type: "image", value: img }
                        ]
                    }];
                    
                    console.log('Getting image description...', descriptionPrompt);
                    const description = await session.prompt(descriptionPrompt);
                    console.log('Image description:', description);
                    
                    // Use the description as our answer text
                    const answerText = text || description.trim();
                    currentOriginalText = answerText;
                    
                    // Now create a new session for emoji generation
                    const emojiSession = await languageModelAPI.create({
                        initialPrompts: [{
                            role: "system",
                            content: "You are an expert at converting text into creative emoji sequences. Take any text input and convert it into 4-8 emojis that tell the same story or convey the same meaning. Be creative and expressive. Only respond with emojis, no text."
                        }]
                    });
                    
                    emojis = await emojiSession.prompt(answerText);
                    emojiSession.destroy();
                    session.destroy();
                    
                } else if (currentMedia?.type === 'audio') {
                    // For audio, we need audio support
                    session = await languageModelAPI.create({
                        expectedInputs: [
                            { type: "text" },
                            { type: "audio" }
                        ],
                        initialPrompts: [{
                            role: "system",
                            content: "You are an expert at transcribing and describing audio content. Listen to the audio and describe what you hear in simple, clear text (2-8 words)."
                        }],
                        monitor(m) {
                            m.addEventListener("downloadprogress", e => {
                                const percent = Math.round(e.loaded * 100);
                                console.log(`Download progress: ${percent}%`);
                                document.querySelector('.generation-mode h2').textContent = 
                                    `Downloading AI model... ${percent}%`;
                            });
                        }
                    });

                    // First get a text description/transcription
                    const transcriptionPrompt = [{
                        role: "user",
                        content: [
                            { type: "text", value: text || "Describe what you hear in this audio in simple words:" },
                            { type: "audio", value: currentMedia.blob }
                        ]
                    }];
                    
                    console.log('Getting audio transcription...', transcriptionPrompt);
                    const transcription = await session.prompt(transcriptionPrompt);
                    console.log('Audio transcription:', transcription);
                    
                    // Use the transcription as our answer text
                    const answerText = text || transcription.trim();
                    currentOriginalText = answerText;
                    
                    // Now create a new session for emoji generation
                    const emojiSession = await languageModelAPI.create({
                        initialPrompts: [{
                            role: "system",
                            content: "You are an expert at converting text into creative emoji sequences. Take any text input and convert it into 4-8 emojis that tell the same story or convey the same meaning. Be creative and expressive. Only respond with emojis, no text."
                        }]
                    });
                    
                    emojis = await emojiSession.prompt(answerText);
                    emojiSession.destroy();
                    session.destroy();
                    
                } else {
                    // Text only
                    const answerText = text || "Create a fun emoji story";
                    currentOriginalText = answerText;
                    
                    session = await languageModelAPI.create({
                        initialPrompts: [{
                            role: "system",
                            content: "You are an expert at converting text into creative emoji sequences. Take any text input and convert it into 4-8 emojis that tell the same story or convey the same meaning. Be creative and expressive. Only respond with emojis, no text."
                        }],
                        monitor(m) {
                            m.addEventListener("downloadprogress", e => {
                                const percent = Math.round(e.loaded * 100);
                                console.log(`Download progress: ${percent}%`);
                                document.querySelector('.generation-mode h2').textContent = 
                                    `Downloading AI model... ${percent}%`;
                            });
                        }
                    });

                    console.log('Getting emojis for text...', answerText);
                    emojis = await session.prompt(answerText);
                    session.destroy();
                }

                // Clean up the response (remove any non-emoji characters)
                emojis = emojis.replace(/[^\p{Emoji}\s]/gu, '').trim();
                
                // Ensure we have some emojis
                if (!emojis) { 
                    emojis = "🤖✨🎭🎪"; // Fallback emojis
                }
                
                console.log('Generated emojis:', emojis);
                console.log('Answer text for encoding:', currentOriginalText);
                
                // Show results
                emojiPreview.textContent = emojis;
                
                const encodedOriginal = btoa(encodeURIComponent(currentOriginalText));
                const encodedEmojis = encodeURIComponent(emojis);
                const url = `${window.location.origin}${window.location.pathname}?e=${encodedEmojis}&o=${encodedOriginal}`;
                
                console.log('Generated share URL:', url);
                console.log('Encoded original text:', encodedOriginal);
                console.log('Test decode:', decodeURIComponent(atob(encodedOriginal)));
                
                shareLink.value = url;
                showMode(resultsMode);
                
                console.log('✅ Emoji generation completed successfully');

            } catch (error) {
                console.error('❌ Error generating emojis:', error);
                let errorMessage = 'Failed to generate emojis. ';
                
                // Handle different types of errors
                const errorMsg = error.message || error.type || 'Unknown error';
                
                if (errorMsg.includes('Chrome AI is not available')) {
                    errorMessage += 'Chrome AI is not available. Please use Chrome Canary with the Prompt API enabled.';
                } else if (error.name === 'NotSupportedError') {
                    errorMessage += 'This type of content is not supported by the AI model.';
                } else if (error.name === 'QuotaExceededError') {
                    errorMessage += 'The content is too large for the AI model.';
                } else if (error.type === 'error' || errorMsg.includes('error')) {
                    errorMessage += 'Error loading image. Please try a different image.';
                } else {
                    errorMessage += 'Please try again.';
                }
                
                alert(errorMessage);
                showMode(createMode);
            }
        });

        // Copy link
        copyBtn.addEventListener('click', () => {
            shareLink.select();
            document.execCommand('copy');
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = 'Copy Challenge Link', 2000);
        });

        // Social media sharing
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('social-btn')) {
                const url = shareLink.value;
                const text = `Can you decode this emoji story? 🧩✨`;
                
                if (e.target.classList.contains('twitter-btn')) {
                    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                    window.open(twitterUrl, '_blank');
                }
                else if (e.target.classList.contains('facebook-btn')) {
                    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                    window.open(facebookUrl, '_blank');
                }
                else if (e.target.classList.contains('linkedin-btn')) {
                    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                    window.open(linkedinUrl, '_blank');
                }
                else if (e.target.classList.contains('whatsapp-btn')) {
                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
                    window.open(whatsappUrl, '_blank');
                }
            }
        });

        // New challenge
        newChallengeBtn.addEventListener('click', () => {
            mainTextarea.value = '';
            currentMedia = null;
            mediaMode.classList.add('hidden');
            mainTextarea.placeholder = "Type your story, drag an image here, or use the camera/microphone buttons above...";
            updateGenerateButton();
            showMode(createMode);
            mainTextarea.focus();
        });

        // Guess input
        guessInput.addEventListener('input', () => {
            submitGuessBtn.disabled = guessInput.value.trim().length === 0;
        });

        guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !submitGuessBtn.disabled) {
                submitGuessBtn.click();
            }
        });

        // Submit guess
        submitGuessBtn.addEventListener('click', () => {
            const guess = guessInput.value.trim();
            const original = currentOriginalText.trim(); 
            
            attempts++;
            console.log(`🎯 Attempt ${attempts}: "${guess}" vs "${original}"`);
            
            if (guess.toLowerCase() === original.toLowerCase()) {
                resultMsg.textContent = '🎉 Correct! Well done!';
                resultMsg.className = 'result-msg result-success';
                resultMsg.classList.remove('hidden');
                playAgainBtn.classList.remove('hidden');
                guessInput.disabled = true;
                submitGuessBtn.disabled = true;
                updateScore(true);
                console.log(`✅ Challenge completed in ${attempts} attempts with ${playerScore} points!`);
            } else {
                resultMsg.textContent = '❌ Not quite right. Try again!';
                resultMsg.className = 'result-msg result-error';
                resultMsg.classList.remove('hidden');
                updateScore(false);
                updateRevealButton();
                
                // Show clue after wrong answer
                showClue();
                
                guessInput.select(); 
            }
        });

        // Reveal answer
        revealBtn.addEventListener('click', () => {
            answerArea.innerHTML = `The answer was: <strong>${currentOriginalText}</strong>`; 
            answerArea.classList.remove('hidden');
            revealSection.classList.add('hidden');
            playAgainBtn.classList.remove('hidden');
            guessInput.disabled = true; 
            submitGuessBtn.disabled = true;
            
            // Deduct points for revealing
            playerScore = Math.max(0, playerScore - 30);
            updateScore();
            console.log(`🔍 Answer revealed! Final score: ${playerScore} points`);
        });

        // Play again
        playAgainBtn.addEventListener('click', () => {
            window.location.href = window.location.origin + window.location.pathname;
        });
        
        // URL handling
        function handleURL() {
            const params = new URLSearchParams(window.location.search);
            const eParam = params.get('e');
            const oParam = params.get('o');

            if (eParam && oParam) {
                try {
                    // Properly decode the original text
                    const decodedBase64 = atob(oParam);
                    currentOriginalText = decodeURIComponent(decodedBase64);
                    
                    // Decode the emojis
                    const decodedEmojis = decodeURIComponent(eParam);
                    emojiDisplay.textContent = decodedEmojis;
                    
                    showMode(decodeMode);
                    resetGame(); // Initialize scoring system
                    guessInput.focus();
                    console.log(`🎮 Starting challenge: "${currentOriginalText}"`);
                    console.log(`🎯 Emojis to decode: "${decodedEmojis}"`);
                } catch (e) {
                    console.error('Failed to decode challenge URL:', e);
                    showMode(createMode);
                }
            } else {
                showMode(createMode);
            }
        }