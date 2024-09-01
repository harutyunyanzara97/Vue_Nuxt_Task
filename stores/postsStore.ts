import { defineStore } from 'pinia';

export const usePostsStore = defineStore('posts', {
    state: () => ({
        posts: [],
        allPosts: [],
        loading: false,
        error: null,
        currentPage: 1,
        totalPages: 0,
    }),
    actions: {
        async fetchPosts(page = 1) {
            this.loading = true;
            this.error = null;

            try {
                const response = await fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=10`);
                if (!response.ok) throw new Error('Network response was not ok');

                const data = await response.json();
                this.allPosts = [...this.allPosts, ...data];
                this.posts = data;

                this.totalPages = Math.ceil(this.allPosts.length / 10);
                this.currentPage = page;
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        async fetchAllPosts() {
            this.loading = true;
            this.error = null;

            try {
                const response = await fetch('https://jsonplaceholder.typicode.com/posts');
                if (!response.ok) throw new Error('Network response was not ok');

                const data = await response.json();
                this.allPosts = data;
                this.totalPages = Math.ceil(this.allPosts.length / 10);
                this.posts = data.slice(0, 10);
                this.currentPage = 1;
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },
    },
});
