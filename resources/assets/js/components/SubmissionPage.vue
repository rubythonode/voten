<template>
<div>
	<category-header v-if="loaded"></category-header>

	<div class="col-7 padding-bottom-10">
		<nsfw-warning v-if="submission.nsfw == 1 && !auth.nsfw"
			:text="'This submission contains NSFW content which can not be displayed according to your personal settings.'">
		</nsfw-warning>

		<div v-if="submission.nsfw == 0 || auth.nsfw">
			<loading v-if="loadingSubmission"></loading>

			<submission v-if="!loadingSubmission" :list="submission" :full="true"></submission>

		    <section class="box-typical comments" id="comments-section" v-if="!loadingSubmission">
		        <header class="box-typical-header-sm bordered user-select flex-space">
		            <div>
		            	<span v-show="comments.length">{{ submission.comments_number }}</span>
		            	Comments: <span class="go-gray go-small">({{ onlineUsers }} online users)</span>
		            </div>
		            <div class="head-sort-icon" v-show="comments.length > 1">
		                <i class="v-icon v-like pointer" aria-hidden="true"
		                   data-toggle="tooltip" data-placement="bottom" title="Hottest"
		                   @click="newSort('hot')"
		                   :class="{ 'go-primary': sort == 'hot' }"></i>
		                <i class="v-icon v-clock pointer" aria-hidden="true"
		                   data-toggle="tooltip" data-placement="bottom" title="Newest"
		                   @click="newSort('new')"
		                   :class="{ 'go-primary': sort == 'new' }"></i>
		            </div>
		        </header>

		        <div class="box-typical-inner ui threaded comments" v-if="submission.id != 0">
		            <comment-form :submission="submission.id" :parent="0"></comment-form>

		            <loading v-if="loadingComments && page < 2"></loading>

					<comment :list="c" :comments-order="commentsOrder" v-for="c in uniqueList" :key="c.id" :full="true"></comment>
		        </div>
		    </section>

		    <button class="v-button v-button--block" v-if="moreComments" @click="loadMoreComments">
	        	Load More Comments
	    	</button>
		</div>
	</div>
</div>
</template>

<script>
	import Submission from '../components/Submission.vue'
	import Comment from '../components/Comment.vue'
	import CommentForm from '../components/CommentForm.vue'
	import CategoryHeader from '../components/CategoryHeader.vue';
	import Loading from '../components/Loading.vue'
	import NsfwWarning from '../components/NsfwWarning.vue'

    export default {

        components: {
            Submission,
            Comment,
            CommentForm,
            Loading,
            CategoryHeader,
			NsfwWarning
        },

        data () {
            return {
            	page: 1,
            	moreComments: false,
                submission: [],
                loadingComments: true,
                loadingSubmission: true,
                comments: [],
                auth,
                sort: 'hot',
                onlineUsers: 0,
                category: this.$route.params.name,
                Store
            }
        },

        created () {
            this.getSubmission()
            this.getComments()
            this.listen()
            this.$eventHub.$on('newComment', this.newComment)
        },

	    watch: {
			// call again the method if the route changes
			'$route' () {
	            this.getSubmission()
	            this.getComments()
	            this.clearContent()
	            this.listen()
	            this.$eventHub.$on('newComment', this.newComment)
			}
		},

        computed: {
			/**
			 * Due to the issue with duplicate notifiactions (cuz the present ones have diffrent
			 * timestamps) we need a different approch to make sure the list is always unique.
			 * This ugly coded methods does it! Maybe move this to the Helpers.js mixin?!
			 *
			 * @return array
			 */
			uniqueList() {
				let unique = []
				let temp = []

				this.comments.forEach(function(element, index, self) {
					if (temp.indexOf(element.id) === -1) {
						unique.push(element)
						temp.push(element.id)
					}
				})

				return unique
			},


        	loaded () {
	            return Store.category.name == this.category
	        },

            /**
             * The order that comments should be printed with
             * @returns String
             */
            commentsOrder: function () {
                if (this.sort == 'hot') {
                    return 'rate'
                }

                return 'created_at'
            },
        },

        methods: {
        	clearContent () {
        		this.page = 1
        		this.comments = []
        	},

        	loadMoreComments () {
        		this.page ++
                this.moreComments = false
        		this.getComments()
        	},

        	/**
	    	 * Checks wheather or not the Store.category needs to be filled or updated, and if yes simply does it
	    	 *
	    	 * @return void
	    	 */
	    	updateCategoryStore () {
	    		if ( Store.category.name == undefined || Store.category.name != this.submission.category_name )
	    		{
		    		this.$root.getCategoryStore(this.submission.category_name)
	    		}
	    	},

            newComment (comment) {
            	if (comment.parent_id == 0) {
					this.comments.unshift(comment)
					this.submission.comments_number ++
                }
            },

            listen () {
                Echo.channel('submission.' + this.$route.params.slug)
                    .listen('CommentCreated', event => {
                    	this.$eventHub.$emit('newComment', event.comment)
                    })

                Echo.join('submission.' + this.$route.params.slug)
				    .here((users) => {
				        this.onlineUsers = users.length
				    }).joining((user) => {
				        this.onlineUsers ++
				    })
				    .leaving((user) => {
				        this.onlineUsers --
				    })
            },

            getSubmission () {
                axios.get('/get-submission', {
            		params: {
            			slug: this.$route.params.slug
            		}
            	}).then((response) => {
					this.submission = response.data

                    if( !this.loaded ) {
                    	Store.category = response.data.category
                    }

                    this.loadingSubmission = false
				}).catch((error) => {
					if (error.response.status === 404) {
						this.$router.push('/404')
					}
				});
            },

            getComments () {
                this.loadingComments = true

                axios.get('/submission-comments', {
                	params: {
	                	submission_slug: this.$route.params.slug,
	                	page: this.page,
	                	sort: this.sort
                	}
                }).then((response) => {
                	this.loadingComments = false

                    this.comments.push(...response.data.data)

                    if (response.data.next_page_url != null) {
                    	this.moreComments = true
                    }
                })
            },

            newSort(sort) {
            	if (sort == this.sort) {
            		return
            	}

            	this.page = 1

            	this.comments = []

            	this.getComments()
                this.sort = sort
            }

        },

    }

</script>
