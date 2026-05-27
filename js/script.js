// Aguarda o DOM carregar completamente
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando CONAD 2026...');
    
    initMobileMenu();
    initCarousel();
    initCountdown();
    initTabs();
    initForm();
    initSmoothScroll();
    
    console.log('✅ CONAD 2026 - Site carregado com sucesso!');
});

// ==========================================
// MENU MOBILE - HAMBURGER
// ==========================================
function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (!toggle || !mobileMenu) {
        console.warn('Menu toggle ou mobile-menu não encontrado');
        return;
    }
    
    // Toggle do menu ao clicar no hamburger
    toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        toggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        
        // Previne scroll quando menu aberto
        if (mobileMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
    
    // Fecha menu ao clicar em qualquer link
    const links = mobileMenu.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            toggle.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Fecha menu ao clicar fora dele
    document.addEventListener('click', function(e) {
        if (!mobileMenu.contains(e.target) && 
            !toggle.contains(e.target) && 
            mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            toggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Fecha menu ao pressionar ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            toggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    console.log('✓ Menu mobile inicializado');
}

// ==========================================
// CAROUSEL DE IMAGENS
// ==========================================
let currentSlide = 0;
let autoplayInterval;
let slides = [];
let dots = [];

function initCarousel() {
    slides = document.querySelectorAll('.carousel-slide');
    dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (slides.length === 0) {
        console.warn('Nenhum slide encontrado');
        return;
    }
    
    console.log('Inicializando carousel com', slides.length, 'slides');
    
    // Eventos dos botões
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            console.log('Botão anterior clicado');
            changeSlide(-1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            console.log('Botão próximo clicado');
            changeSlide(1);
        });
    }
    
    // Eventos dos dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            console.log('Dot', index, 'clicado');
            goToSlide(index);
        });
    });
    
    // Inicia no primeiro slide
    showSlide(0);
    startAutoplay();
    
    // Pause ao passar mouse
    const carousel = document.querySelector('.carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);
    }
    
    console.log('✓ Carousel inicializado');
}

function changeSlide(direction) {
    console.log('Mudando slide. Direção:', direction);
    
    // Remove active do slide atual
    slides[currentSlide].classList.remove('active');
    if (dots[currentSlide]) dots[currentSlide].classList.remove('active');
    
    // Calcula novo slide
    currentSlide = currentSlide + direction;
    
    // Loop infinito
    if (currentSlide >= slides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    
    console.log('Novo slide:', currentSlide);
    
    // Adiciona active ao novo slide
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    
    resetAutoplay();
}

function goToSlide(index) {
    console.log('Indo para slide:', index);
    
    if (index < 0 || index >= slides.length) return;
    
    // Remove active
    slides[currentSlide].classList.remove('active');
    if (dots[currentSlide]) dots[currentSlide].classList.remove('active');
    
    // Atualiza índice
    currentSlide = index;
    
    // Adiciona active
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    
    resetAutoplay();
}

function showSlide(index) {
    if (slides.length === 0 || index < 0 || index >= slides.length) return;
    
    // Remove todas as classes active
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (dots[i]) dots[i].classList.remove('active');
    });
    
    // Adiciona active ao slide específico
    slides[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
    
    currentSlide = index;
}

function startAutoplay() {
    stopAutoplay(); // Limpa qualquer interval existente
    autoplayInterval = setInterval(() => {
        changeSlide(1);
    }, 5000); // Muda a cada 5 segundos
    console.log('Autoplay iniciado');
}

function stopAutoplay() {
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
        console.log('Autoplay pausado');
    }
}

function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
}

// ==========================================
// COUNTDOWN TIMER
// ==========================================
function initCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) {
        console.warn('Elemento countdown não encontrado');
        return;
    }
    
    // Data do evento: 15 de Agosto de 2026, 09:00
    const eventDate = new Date('2026-08-15T09:00:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = eventDate - now;
        
        if (distance < 0) {
            countdownElement.innerHTML = '<h2 style="color: white; font-size: 2rem;">🎉 Evento iniciado! 🎉</h2>';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    console.log('✓ Countdown inicializado');
}

// ==========================================
// TABS (PROGRAMAÇÃO)
// ==========================================
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    if (tabButtons.length === 0) {
        console.warn('Nenhum botão de tab encontrado');
        return;
    }
    
    console.log('✓ Tabs inicializadas');
}

function showDay(day) {
    // Esconde todos os conteúdos
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Remove active dos botões
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostra o dia selecionado
    const dayContent = document.getElementById('day' + day);
    if (dayContent) {
        dayContent.style.display = 'block';
    }
    
    // Adiciona active no botão
    const buttons = document.querySelectorAll('.tab-btn');
    if (buttons[day - 1]) {
        buttons[day - 1].classList.add('active');
    }
}

// ==========================================
// FORMULÁRIO DE CONTATO
// ==========================================
function initForm() {
    const form = document.getElementById('contactForm');
    if (!form) {
        console.warn('Formulário não encontrado');
        return;
    }
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
        
        // Simula envio (remover quando integrar com backend real)
        setTimeout(() => {
            alert('✅ Mensagem enviada com sucesso!\n\nEntraremos em contato em breve.');
            form.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1500);
    });
    
    console.log('✓ Formulário inicializado');
}

// ==========================================
// SMOOTH SCROLL
// ==========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Ignora links vazios ou apenas "#"
            if (!href || href === '#') return;
            
            e.preventDefault();
            
            const target = document.querySelector(href);
            if (target) {
                const headerOffset = 80; // Altura do header fixo
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    console.log('✓ Smooth scroll inicializado');
}

// ==========================================
// HEADER COM SCROLL EFFECT
// ==========================================
window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});

// ==========================================
// PREVINE ERRO DE IMAGENS NÃO CARREGADAS
// ==========================================
window.addEventListener('load', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            console.warn('Erro ao carregar imagem:', this.src);
        });
    });
});

console.log('✅ CONAD 2026 - Todos os scripts carregados!');
