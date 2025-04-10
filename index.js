class MovieSlider {
    constructor() {
        this.container = document.querySelector('.slider-container');
        this.slider = document.querySelector('.slider');
        this.loading = document.querySelector('.loading');
        this.prevBtn = document.querySelector('.prev');
        this.nextBtn = document.querySelector('.next');
        
        this.slideWidth = 420;
        this.currentIndex = 0;
        this.isAnimating = false;
        this.touchStartX = 0;
        this.touchMoveX = 0;

        this.apiConfig = {
            imgUrl: "https://image.tmdb.org/t/p/w500",
            apiUrl: "https://api.themoviedb.org/3/trending/movie/day?language=en-US",
            baseLink: "https://www.themoviedb.org/movie/",
            options: {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNTAwNTgyZGMzMTk1MjMzODY4MzI2ODFiNzkwMjg2ZiIsIm5iZiI6MTc0NDE3NDUwNi4xMDQsInN1YiI6IjY3ZjVmZGFhZDNhYjdkN2E4YmFjZTg3MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.IGjH_97paeQUZ3va3pHcgMjdu54o4EjOQrWIH_6_WqQ'
                }
            }
        };

        this.init();
    }

    async init() {
        try {
            await this.fetchMovies();
            if (this.movies && this.movies.length > 0) {
                this.createSlides();
                this.setupEventListeners();
                this.updateSlider();
                this.startAutoplay();
                this.loading.style.display = 'none'; // Hide loading when done
            } else {
                this.loading.textContent = 'No movies found';
            }
        } catch (error) {
            this.loading.textContent = 'Error loading movies';
            console.error('Initialization error:', error);
        }
    }

    async fetchMovies() {
        const response = await fetch(this.apiConfig.apiUrl, this.apiConfig.options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        this.movies = data.results.map(movie => ({
            image: `${this.apiConfig.imgUrl}${movie.poster_path}`,
            link: `${this.apiConfig.baseLink}${movie.id}`,
            title: movie.title // Qo‘shimcha ma’lumot sifatida title qo‘shdim
        }));
    }

    createSlides() {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < this.movies.length * 3; i++) {
            const index = i % this.movies.length;
            const slide = document.createElement('div');
            slide.className = 'slide';
            slide.innerHTML = `
                <a href="${this.movies[index].link}" target="_blank">
                    <img src="${this.movies[index].image}" alt="${this.movies[index].title}">
                </a>`;
            fragment.appendChild(slide);
        }
        this.slider.appendChild(fragment);
    }

    updateSlider() {
        const offset = (this.container.offsetWidth - this.slideWidth) / 2;
        const transform = -this.currentIndex * (this.slideWidth + 20) + offset;
        this.slider.style.transform = `translateX(${transform}px)`;
    }

    move(direction) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.currentIndex += direction;

        this.updateSlider();

        if (this.currentIndex >= this.movies.length * 2 || this.currentIndex <= this.movies.length - 1) {
            setTimeout(() => {
                this.slider.style.transition = 'none';
                this.currentIndex = this.currentIndex >= this.movies.length * 2
                    ? this.currentIndex - this.movies.length
                    : this.currentIndex + this.movies.length;
                this.updateSlider();
                this.slider.style.transition = 'transform var(--transition-speed) ease-out';
            }, 400);
        }

        setTimeout(() => this.isAnimating = false, 400);
    }

    startAutoplay() {
        this.stopAutoplay();
        this.autoplay = setInterval(() => this.move(1), 3000);
    }

    stopAutoplay() {
        clearInterval(this.autoplay);
    }

    setupEventListeners() {
        this.nextBtn.addEventListener('click', () => this.move(1));
        this.prevBtn.addEventListener('click', () => this.move(-1));
        window.addEventListener('resize', () => this.updateSlider());

        this.slider.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.stopAutoplay();
        });

        this.slider.addEventListener('touchmove', (e) => {
            this.touchMoveX = e.touches[0].clientX;
        });

        this.slider.addEventListener('touchend', () => {
            const diff = this.touchStartX - this.touchMoveX;
            if (Math.abs(diff) > 50) {
                this.move(diff > 0 ? 1 : -1);
            }
            this.startAutoplay();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new MovieSlider());