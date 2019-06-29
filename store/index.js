import Vuex from 'vuex';

const createStore = () => {
  return new Vuex.Store({
    state: {
      loadedPosts: []
    },
    mutations: {
      setPosts(state, posts) {
        state.loadedPosts = posts;
      },
      addPost(state, post) {
        state.loadedPosts.push(post);
      },
      editPost(state, editedPost) {
        const postIndex = state.loadedPosts.findIndex(post => post.id === editedPost.id);
        state.loadedPosts[postIndex] = editedPost;
      }
    },
    actions: {
      nuxtServerInit(context, vueContext) {
        return vueContext.app.$axios
          .$get('/posts.json')
          .then(data => {
            const postsArray = [];
            for (const key in data) {
              postsArray.push({ ...data[key], id: key });
            }
            context.commit('setPosts', postsArray);
          })
          .catch(err => vueContext.error(err));
      },
      setPosts(context, posts) {
        context.commit('setPosts', posts);
      },
      addPost(context, post) {
        const createdPost = {
          ...post,
          updatedDate: new Date()
        };
        return this.$axios.$post(`/posts.json`, createdPost)
          .then(data => {
            context.commit('addPost', {...createdPost, id: data.name});
          })
          .catch(err => console.log(err));
      },
      editPost(context, post) {
        const editedPost = {
          ...post,
          updatedDate: new Date()
        }
        return this.$axios.$put(`/posts/${editedPost.id}.json`, editedPost)
          .then(res => {
            context.commit('editPost', editedPost);
          })
          .catch(err => console.log(err));
      }
    },
    getters: {
      loadedPosts(state) {
        return state.loadedPosts;
      }
    }
  });
}

export default createStore;
