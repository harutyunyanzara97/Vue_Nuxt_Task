// stores/postsStore.js
import { defineStore } from 'pinia';

export const usePostsStore = defineStore('posts', {
    state: () => ({
        posts: [],
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
                this.posts = data;
                // Update pagination (example assumes 100 total posts)
                this.totalPages = Math.ceil(100 / 10);
                this.currentPage = page;
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },
    },
});
