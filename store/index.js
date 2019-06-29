import Vuex from 'vuex';
import Cookie from 'js-cookie';

const createStore = () => {
  return new Vuex.Store({
    state: {
      loadedPosts: [],
      token: null
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
      },
      setToken(state, token) {
        state.token = token;
      },
      clearToken(state) {
        state.token = null;
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
        return this.$axios.$post(`/posts.json?auth=${context.state.token}`, createdPost)
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
        return this.$axios.$put(`/posts/${editedPost.id}.json?auth=${context.state.token}`, editedPost)
          .then(res => {
            context.commit('editPost', editedPost);
          })
          .catch(err => console.log(err));
      },
      authenticateUser(context, authData) {
        let authUrl = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${process.env.fbAPIKey}`;
        if (!authData.isLogin) {
          authUrl = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=${process.env.fbAPIKey}`;
        }
        return this.$axios
          .$post(authUrl, {
            email: authData.email,
            password: authData.password,
            returnSecureToken: true
          })
          .then(data => {
            context.commit('setToken', data.idToken);
            localStorage.setItem('token', data.idToken);
            localStorage.setItem('tokenExpiration', new Date().getTime() + Number.parseInt(data.expiresIn) * 1000);
            Cookie.set('jwt', data.idToken);
            Cookie.set('expirationDate', new Date().getTime() + Number.parseInt(data.expiresIn) * 1000);
          })
          .catch(err => console.log(err));
      },
      initAuth(context, req) {
        let token;
        let expirationDate;
        if (req) {
          if (!req.headers.cookie) {
            return;
          }
          const jwtCookie = req.headers.cookie
            .split(';')
            .find(c => c.trim().startsWith('jwt='));
          const jwtExpirationDate = req.headers.cookie
            .split(';')
            .find(c => c.trim().startsWith('expirationDate='));
          if (jwtCookie) {
            token = jwtCookie.split('=')[1];
          }
          if (jwtExpirationDate) {
            expirationDate = jwtExpirationDate.split('=')[1];
          }
        } else {
          token = localStorage.getItem('token');
          expirationDate = localStorage.getItem('tokenExpiration');
        }
        if (!token || new Date().getTime() > +expirationDate) {
          console.log('No token or invalid token');
          context.dispatch('logout');
          return;
        }
        context.commit('setToken', token);
      },
      logout(context) {
        context.commit('clearToken');
        Cookie.remove('jwt');
        Cookie.remove('expirationDate');
        if (process.client) {
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiration');
        }
      }
    },
    getters: {
      loadedPosts(state) {
        return state.loadedPosts;
      },
      isAuthenticated(state) {
        return state.token != null;
      }
    }
  });
}

export default createStore;
