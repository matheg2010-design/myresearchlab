// Main JavaScript File for بحثي Platform
// Author: محمود محمد عبدالرحيم
// Date: 2025

class BahithiPlatform {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initAnimations();
        this.initParticles();
        this.initCharts();
        this.initScrollAnimations();
        this.initCounterAnimations();
    }

    setupEventListeners() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(26, 54, 93, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(26, 54, 93, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        });

        // Service cards hover effects
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                anime({
                    targets: card.querySelector('.service-icon'),
                    scale: 1.2,
                    rotate: '5deg',
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            });

            card.addEventListener('mouseleave', () => {
                anime({
                    targets: card.querySelector('.service-icon'),
                    scale: 1,
                    rotate: '0deg',
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            });
        });
    }

    initAnimations() {
        // Hero section animations
        const heroTimeline = anime.timeline({
            easing: 'easeOutExpo',
            duration: 1000
        });

        heroTimeline
            .add({
                targets: '.hero-title',
                opacity: [0, 1],
                translateY: [50, 0],
                delay: 500
            })
            .add({
                targets: '.hero-subtitle',
                opacity: [0, 1],
                translateY: [30, 0],
                delay: 200
            }, '-=700')
            .add({
                targets: '.hero-buttons',
                opacity: [0, 1],
                translateY: [20, 0],
                delay: 300
            }, '-=500');

        // Button hover animations
        document.querySelectorAll('.btn-primary-custom, .btn-outline-custom').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                anime({
                    targets: btn,
                    translateY: -5,
                    scale: 1.05,
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            });

            btn.addEventListener('mouseleave', () => {
                anime({
                    targets: btn,
                    translateY: 0,
                    scale: 1,
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            });
        });
    }

    initParticles() {
        const canvas = document.getElementById('particles-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;

        // Resize canvas
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Particle class
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 2 + 1;
                this.opacity = Math.random() * 0.5 + 0.2;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(214, 158, 46, ${this.opacity})`;
                ctx.fill();
            }
        }

        // Create particles
        for (let i = 0; i < 50; i++) {
            particles.push(new Particle());
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Draw connections
            particles.forEach((particle, i) => {
                particles.slice(i + 1).forEach(otherParticle => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.strokeStyle = `rgba(214, 158, 46, ${0.1 * (1 - distance / 100)})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                });
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();
    }

    initCharts() {
        // Features chart using ECharts
        const chartElement = document.getElementById('features-chart');
        if (chartElement) {
            const chart = echarts.init(chartElement);
            
            const option = {
                title: {
                    text: 'خدمات المنصة الشاملة',
                    left: 'center',
                    textStyle: {
                        color: '#1a365d',
                        fontSize: 18,
                        fontWeight: 'bold'
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    textStyle: {
                        color: '#2d3748'
                    }
                },
                series: [
                    {
                        name: 'الخدمات',
                        type: 'pie',
                        radius: ['40%', '70%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: 10,
                            borderColor: '#fff',
                            borderWidth: 2
                        },
                        label: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: '18',
                                fontWeight: 'bold'
                            }
                        },
                        labelLine: {
                            show: false
                        },
                        data: [
                            { value: 35, name: 'التحليل الإحصائي', itemStyle: { color: '#d69e2e' } },
                            { value: 25, name: 'كتابة البحوث', itemStyle: { color: '#1a365d' } },
                            { value: 20, name: 'الاستشارات', itemStyle: { color: '#38a169' } },
                            { value: 20, name: 'التدريب', itemStyle: { color: '#805ad5' } }
                        ]
                    }
                ]
            };

            chart.setOption(option);

            // Make chart responsive
            window.addEventListener('resize', () => {
                chart.resize();
            });
        }
    }

    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Add stagger animation for service cards
                    if (entry.target.classList.contains('service-card')) {
                        const cards = document.querySelectorAll('.service-card');
                        cards.forEach((card, index) => {
                            setTimeout(() => {
                                card.classList.add('visible');
                            }, index * 200);
                        });
                    }
                }
            });
        }, observerOptions);

        // Observe all fade-in elements
        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    }

    initCounterAnimations() {
        const counters = document.querySelectorAll('.stat-number');
        
        const animateCounter = (counter) => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };

            updateCounter();
        };

        // Trigger counter animation when stats section is visible
        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        counters.forEach(counter => {
                            animateCounter(counter);
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(statsSection);
        }
    }
}

// Statistical Tools Class for Statistics Page
class StatisticalTools {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.userAnswers = {};
        this.init();
    }

    init() {
        if (document.getElementById('statistical-wizard')) {
            this.setupWizard();
            this.loadStatisticalTests();
        }
    }

    setupWizard() {
        this.showStep(1);
        this.setupNavigation();
    }

    showStep(step) {
        // Hide all steps
        document.querySelectorAll('.wizard-step').forEach(stepEl => {
            stepEl.style.display = 'none';
        });

        // Show current step
        const currentStepEl = document.getElementById(`step-${step}`);
        if (currentStepEl) {
            currentStepEl.style.display = 'block';
            
            // Animate step appearance
            anime({
                targets: currentStepEl,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 500,
                easing: 'easeOutQuad'
            });
        }

        this.updateProgressBar();
    }

    updateProgressBar() {
        const progress = (this.currentStep / this.totalSteps) * 100;
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            progressBar.textContent = `الخطوة ${this.currentStep} من ${this.totalSteps}`;
        }
    }

    setupNavigation() {
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        const finishBtn = document.getElementById('finish-btn');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevStep());
        }

        if (finishBtn) {
            finishBtn.addEventListener('click', () => this.finishWizard());
        }
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.saveCurrentAnswer();
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateNavigationButtons();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateNavigationButtons();
        }
    }

    updateNavigationButtons() {
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        const finishBtn = document.getElementById('finish-btn');

        if (prevBtn) {
            prevBtn.style.display = this.currentStep > 1 ? 'block' : 'none';
        }

        if (nextBtn && finishBtn) {
            if (this.currentStep === this.totalSteps) {
                nextBtn.style.display = 'none';
                finishBtn.style.display = 'block';
            } else {
                nextBtn.style.display = 'block';
                finishBtn.style.display = 'none';
            }
        }
    }

    saveCurrentAnswer() {
        const currentStepEl = document.getElementById(`step-${this.currentStep}`);
        const selectedOption = currentStepEl.querySelector('input[type="radio"]:checked');
        
        if (selectedOption) {
            this.userAnswers[`step${this.currentStep}`] = selectedOption.value;
        }
    }

    finishWizard() {
        this.saveCurrentAnswer();
        this.showRecommendations();
    }

    showRecommendations() {
        const recommendations = this.calculateRecommendations();
        const resultsDiv = document.getElementById('wizard-results');
        
        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <div class="recommendation-card">
                    <h3 class="arabic-heading">الاختبارات الإحصائية المقترحة</h3>
                    <div class="recommended-tests">
                        ${recommendations.map(test => `
                            <div class="test-item">
                                <h4>${test.name}</h4>
                                <p>${test.description}</p>
                                <a href="statistics.html#test-${test.id}" class="btn btn-sm btn-primary">تعلم المزيد</a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            resultsDiv.style.display = 'block';
            resultsDiv.scrollIntoView({ behavior: 'smooth' });
        }
    }

    calculateRecommendations() {
        // Logic to determine appropriate statistical tests based on user answers
        const answers = this.userAnswers;
        const recommendations = [];

        // Sample logic - in real implementation, this would be more sophisticated
        if (answers.step1 === 'two-groups' && answers.step2 === 'continuous') {
            recommendations.push({
                id: 't-test',
                name: 'اختبار T (T-Test)',
                description: 'للمقارنة بين مجموعتين على متغير مستمر'
            });
        }

        if (answers.step1 === 'three-plus-groups') {
            recommendations.push({
                id: 'anova',
                name: 'تحليل التباين (ANOVA)',
                description: 'للمقارنة بين ثلاث مجموعات أو أكثر'
            });
        }

        if (answers.step2 === 'categorical') {
            recommendations.push({
                id: 'chi-square',
                name: 'اختبار مربع كاي (Chi-Square)',
                description: 'للعلاقة بين المتغيرات التصنيفية'
            });
        }

        return recommendations;
    }

    loadStatisticalTests() {
        // Load statistical tests database
        const testsDatabase = [
            {
                id: 't-test',
                name: 'اختبار T (T-Test)',
                category: 'parametric',
                dataType: 'continuous',
                groups: 2,
                description: 'يستخدم لاختبار الفرق بين متوسطي مجموعتين مستقلتين أو متصلتين',
                conditions: [
                    'البيانات مستمرة',
                    'التوزيع الطبيعي للبيانات',
                    'تجانب التباين (للمجموعات المستقلة)'
                ],
                spssSteps: [
                    'اختر Analyze → Compare Means → Independent-Samples T Test',
                    'حدد المتغير التابع في Test Variable(s)',
                    'حدد متغير التجميع في Grouping Variable',
                    'اضغط على Define Groups وحدد قيم المجموعات',
                    'اضغط OK للحصول على النتائج'
                ],
                excelSteps: [
                    'استخدم الدالة T.TEST(array1, array2, tails, type)',
                    'Array1: نطاق البيانات للمجموعة الأولى',
                    'Array2: نطاق البيانات للمجموعة الثانية',
                    'Tails: 1 للاختبار أحادي الجانب، 2 للثنائي',
                    'Type: 1 لمجموعات مترابطة، 2 لمجموعات مستقلة'
                ]
            },
            {
                id: 'anova',
                name: 'تحليل التباين (ANOVA)',
                category: 'parametric',
                dataType: 'continuous',
                groups: 3,
                description: 'يختبر الفرق بين متوسطات ثلاث مجموعات أو أكثر',
                conditions: [
                    'البيانات مستمرة',
                    'التوزيع الطبيعي للبيانات',
                    'تجانب التباين بين المجموعات',
                    'استقلال المشاهدات'
                ],
                spssSteps: [
                    'اختر Analyze → Compare Means → One-Way ANOVA',
                    'حدد المتغير التابع في Dependent List',
                    'حدد متغير التجميع في Factor',
                    'اضغط على Post Hoc لاختبارات المقارنات المتعددة',
                    'اختر طريقة الاختبار (مثل Tukey) واضغط Continue ثم OK'
                ],
                excelSteps: [
                    'استخدم أداة Data Analysis → ANOVA: Single Factor',
                    'حدد نطاق البيانات المدخلة',
                    'حدد Alpha (عادة 0.05)',
                    'اختر موقع النتائج واضغط OK'
                ]
            },
            {
                id: 'chi-square',
                name: 'اختبار مربع كاي (Chi-Square)',
                category: 'non-parametric',
                dataType: 'categorical',
                groups: 2,
                description: 'يختبر العلاقة بين متغيرين تصنيفيين أو تطابق البيانات مع توزيع نظري',
                conditions: [
                    'البيانات تصنيفية',
                    'الاستقلال المطلق',
                    'الأعداد المتوقعة > 5 في كل خلية'
                ],
                spssSteps: [
                    'اختر Analyze → Descriptive Statistics → Crosstabs',
                    'حدد متغير الصفوف والأعمدة',
                    'اضغط على Statistics واختر Chi-square',
                    'اضغط على Cells واختر Expected وPercentages',
                    'اضغط OK للحصول على النتائج'
                ],
                excelSteps: [
                    'أنشئ جدول التكرارات المتقاطعة',
                    'استخدم الدالة CHISQ.TEST(actual_range, expected_range)',
                    'للحصول على القيمة الحرجة: CHISQ.INV.RT(probability, df)',
                    'لحساب درجات الحرية: (rows-1) * (columns-1)'
                ]
            }
        ];

        // Store tests data globally for use in other functions
        window.statisticalTests = testsDatabase;
    }
}

// Form Handler Class
class FormHandler {
    constructor() {
        this.init();
    }

    init() {
        this.setupFormValidation();
        this.setupFileUpload();
    }

    setupFormValidation() {
        const forms = document.querySelectorAll('.needs-validation');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                if (form.checkValidity()) {
                    this.submitForm(form);
                } else {
                    e.stopPropagation();
                }
                
                form.classList.add('was-validated');
            });
        });
    }

    setupFileUpload() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const fileName = e.target.files[0]?.name || 'اختر ملف...';
                const label = input.nextElementSibling;
                if (label && label.classList.contains('custom-file-label')) {
                    label.textContent = fileName;
                }
            });
        });
    }

    async submitForm(form) {
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
        }

        try {
            // Simulate form submission (replace with actual endpoint)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showSuccessMessage();
            form.reset();
            form.classList.remove('was-validated');
            
        } catch (error) {
            this.showErrorMessage();
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'إرسال الطلب';
            }
        }
    }

    showSuccessMessage() {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show';
        alert.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <strong>تم الإرسال بنجاح!</strong> سيتم التواصل معك خلال 24-48 ساعة.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.insertBefore(alert, document.body.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 5000);
    }

    showErrorMessage() {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show';
        alert.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <strong>حدث خطأ!</strong> يرجى المحاولة مرة أخرى لاحقاً.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.insertBefore(alert, document.body.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 5000);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BahithiPlatform();
    new FormHandler();
    
    // Add loading animation
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1a365d, #2d3748);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
    `;
    
    loader.innerHTML = `
        <div style="text-align: center; color: white;">
            <i class="fas fa-graduation-cap" style="font-size: 4rem; margin-bottom: 1rem; color: #d69e2e;"></i>
            <h2 class="arabic-heading" style="margin-bottom: 0.5rem;">بحثي</h2>
            <p>جاري تحميل المنصة...</p>
        </div>
    `;
    
    document.body.appendChild(loader);
    
    // Remove loader after page is fully loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                }
            }, 500);
        }, 1000);
    });
});

// Export classes for use in other files
window.BahithiPlatform = BahithiPlatform;
window.StatisticalTools = StatisticalTools;
window.FormHandler = FormHandler;