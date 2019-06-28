import Vuex from 'vuex';

const createStore = () => {
  return new Vuex.Store({
    state: {
      loadedPosts: []
    },
    mutations: {
      setPosts(state, posts) {
        state.loadedPosts = posts;
      }
    },
    actions: {
      nuxtServerInit(context, vueContext) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            context.commit('setPosts', [
              {
                id: '1',
                title: 'First Post',
                previewText: 'This is our first post!',
                thumbnail: 'https://static.pexels.com/photos/270348/pexels-photo-270348.jpeg'
              },
              {
                id: '2',
                title: 'Second Post',
                previewText: 'This is our second post!',
                thumbnail: 'https://static.pexels.com/photos/270348/pexels-photo-270348.jpeg'
              }
            ])
            resolve();
          }, 1500);
        });
      },
      setPosts(context, posts) {
        context.commit('setPosts', posts);
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
