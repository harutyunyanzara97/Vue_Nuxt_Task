<template>
  <div class="p-8 bg-gray-100 text-black">
    <!-- Create Post Button -->
    <button @click="openModal" class="bg-gray-800 text-white py-2 px-4 rounded mb-6">
      Create New Post
    </button>

    <!-- SEARCH -->
    <div class="search-controls rounded w-[250px] mb-4">
      <label for="searchInput" class="mr-2">Search:</label>
      <input
          id="searchInput"
          v-model="searchQuery"
          type="text"
          placeholder="Search by title or body"
          class="border p-2 rounded w-full"
      />
    </div>

    <!-- Sorting Controls -->
    <div class="sorting-controls mb-4">
      <label for="sortOrder" class="mr-2">Sort by ID:</label>
      <select id="sortOrder" v-model="sortOrder" @change="sortPosts">
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>

    <!-- Posts Table -->
    <table class="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
      <thead class="bg-gray-800 text-white">
      <tr>
        <th class="py-3 px-6 border-r border-gray-200">ID</th>
        <th class="py-3 px-6 border-r border-gray-200">User ID</th>
        <th class="py-3 px-6 border-r border-gray-200">Title</th>
        <th class="py-3 px-6 border-r border-gray-200">Body</th>
      </tr>
      </thead>
      <tbody>
      <tr class="text-center" v-for="post in paginatedPosts" :key="post.id">
        <td class="py-3 px-6 border-b border-r border-gray-200">{{ post.id }}</td>
        <td class="py-3 px-6 border-b border-r border-gray-200">{{ post.userId }}</td>
        <td class="py-3 px-6 border-b border-r border-gray-200">{{ post.title }}</td>
        <td class="py-3 px-6 border-b border-r border-gray-200">{{ post.body }}</td>
      </tr>
      <tr v-if="loading">
        <td colspan="4" class="py-3 px-6 text-center">
          <div class="spinner"></div>
        </td>
      </tr>
      <tr v-if="error">
        <td colspan="4" class="py-3 px-6 text-center text-red-500">Error loading data</td>
      </tr>
      </tbody>
    </table>

    <div class="pagination-controls">
      <button
          @click="prevPage"
          :disabled="loading || currentPage === 1"
          class="pagination-button prev-button"
      >
        Previous
      </button>
      <button
          @click="nextPage"
          :disabled="loading || currentPage === totalPages"
          class="pagination-button next-button"
      >
        Next
      </button>
    </div>

    <!-- Create Post Modal -->
    <create-post-modal v-if="isModalOpen" @close="closeModal">
      <template #header>
        <h2 class="text-2xl">Create New Post</h2>
      </template>
      <template #body>
        <form @submit.prevent="createPost" class="space-y-4">
          <div>
            <label for="userId" class="block mb-1">User ID</label>
            <input
                id="userId"
                v-model="newPost.userId"
                type="number"
                required
                class="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label for="title" class="block mb-1">Title</label>
            <input
                id="title"
                v-model="newPost.title"
                type="text"
                required
                class="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label for="body" class="block mb-1">Body</label>
            <textarea
                id="body"
                v-model="newPost.body"
                required
                class="border p-2 rounded w-full"
            ></textarea>
          </div>
          <button
              type="submit"
              class="bg-green-500 text-white py-2 px-4 rounded"
              :disabled="loading"
          >
            Add Post
          </button>
        </form>
      </template>
    </create-post-modal>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, watch} from 'vue';
import {usePostsStore} from '@/stores/postsStore';
import CreatePostModal from "@/components/modals/createPostModal.vue";

const postsStore = usePostsStore();

const posts = computed(() => postsStore.allPosts);
const loading = computed(() => postsStore.loading);
const error = computed(() => postsStore.error);
const currentPage = computed(() => postsStore.currentPage);
const totalPages = computed(() => postsStore.totalPages);
const isModalOpen = ref(false);
const newPost = ref({
  userId: '',
  title: '',
  body: ''
});
const sortOrder = ref('desc');
const searchQuery = ref('');

const fetchPosts = (page) => {
  postsStore.fetchPosts(page);
};

const createPost = async () => {
  if (loading.value) return;

  postsStore.loading = true;
  postsStore.error = null;

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newPost.value)
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const createdPost = await response.json();

    postsStore.allPosts = [...postsStore.allPosts, createdPost];
    await fetchPosts(currentPage.value);
    newPost.value = {userId: '', title: '', body: ''};
    closeModal();
  } catch (err) {
    postsStore.error = err.message;
  } finally {
    postsStore.loading = false;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    fetchPosts(currentPage.value - 1);
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    fetchPosts(currentPage.value + 1);
  }
};

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const sortPosts = () => {
  postsStore.allPosts = [...postsStore.allPosts].sort((a, b) => {
    if (sortOrder.value === 'asc') {
      return a.id - b.id;
    } else {
      return b.id - a.id;
    }
  });
};

const filteredPosts = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return posts.value.filter(post =>
      post.title.toLowerCase().includes(query) ||
      post.body.toLowerCase().includes(query)
  );
});

const sortedPosts = computed(() => {
  return [...filteredPosts.value].sort((a, b) => {
    if (sortOrder.value === 'asc') {
      return a.id - b.id;
    } else {
      return b.id - a.id;
    }
  });
});

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * 10;
  const end = start + 10;
  return sortedPosts.value.slice(start, end);
});

onMounted(() => {
  postsStore.fetchAllPosts();
});
</script>
<style scoped>

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left: 4px solid #333;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.create-post-form {
  background-color: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.create-post-form input,
.create-post-form textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
}

.create-post-form button {
  background-color: #38a169;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.create-post-form button:disabled {
  background-color: #e2e8f0;
  cursor: not-allowed;
}

.create-post-form button:hover:not(:disabled) {
  background-color: #2f855a;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  position: relative;
}

.modal-header h2 {
  margin: 0;
}

.pagination-controls {
  display: flex;
  justify-content: center;
}

.pagination-button {
  background-color: #4a5568;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.pagination-button:disabled {
  background-color: #e2e8f0; /* Light gray */
  cursor: not-allowed;
}

.prev-button {
  margin-right: 8px;
}

.next-button {
  margin-left: 8px;
}

.sorting-controls {
  display: flex;
  align-items: center;
}

.sorting-controls select {
  margin-left: 8px;
  padding: 4px;
  border-radius: 4px;
  border: 1px solid #ddd;
}
</style>