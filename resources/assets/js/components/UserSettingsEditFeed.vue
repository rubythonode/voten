<template>
    <section>
        <h3 class="dotted-title">
            <span>
                My Home Feed
            </span>
        </h3>

        <p>
            Other than subscribing to channels, there are more filters available to make sure you get the
            content that suits you the best.
        </p>

        <div class="form-group ui form">
            <div class="inline field">
                <div class="ui toggle checkbox">
                    <input type="checkbox" tabindex="1" class="hidden" v-model="nsfw">
                    <label>Display NSFW submissions (You must be 18 or older)</label>
                </div>
            </div>
        </div>

        <div class="form-group ui form">
            <div class="inline field">
                <div class="ui toggle checkbox">
                    <input type="checkbox" tabindex="1" class="hidden" v-model="nsfwMedia">
                    <label>Display preview for NSFW submissions</label>
                </div>
            </div>
        </div>

        <div class="form-group ui form">
            <div class="inline field">
                <div class="ui toggle checkbox">
                    <input type="checkbox" tabindex="1" class="hidden" v-model="exclude_upvoted_submissions">
                    <label>Exclude my upvoted submissions</label>
                </div>
            </div>
        </div>

        <div class="form-group ui form">
            <div class="inline field">
                <div class="ui toggle checkbox">
                    <input type="checkbox" tabindex="1" class="hidden" v-model="exclude_downvoted_submissions">
                    <label>Exclude my downvoted submissions</label>
                </div>
            </div>
        </div>

        <div class="form-group ui form" v-if="!auth.isMobileDevice">
            <div class="inline field">
                <div class="ui toggle checkbox">
                    <input type="checkbox" tabindex="1" class="hidden" v-model="submission_small_thumbnail">
                    <label>Use small thumbnail for submissions(classic view)</label>
                </div>
            </div>
        </div>

        <button class="v-button v-button--green" @click="save" :disabled="sending" v-if="changed">Save</button>
    </section>
</template>

<script>
    export default {
        data: function () {
            return {
                sending: false,
            	errors: [],
            	customError: '',
                auth,
                nsfw: auth.nsfw,
                nsfwMedia: auth.nsfwMedia,
                exclude_upvoted_submissions: auth.exclude_upvoted_submissions,
                exclude_downvoted_submissions: auth.exclude_downvoted_submissions,
                submission_small_thumbnail: auth.submission_small_thumbnail,
            }
        },

        created () {
        	document.title = 'My Feed | Settings'
        },

        mounted () {
			this.$nextTick(function () {
				this.$root.loadCheckBox()
			})
        },

	    computed: {
	    	changed () {
	    		if (
	                auth.nsfw != this.nsfw ||
	                auth.nsfwMedia != this.nsfwMedia ||
	                auth.exclude_upvoted_submissions != this.exclude_upvoted_submissions ||
	                auth.submission_small_thumbnail != this.submission_small_thumbnail ||
	                auth.exclude_downvoted_submissions != this.exclude_downvoted_submissions
	                ) {
		    			return true
		    		}

	    		return false
	    	},
	    },

        methods: {
            /**
             * Stores the changes in the database. (using the recently changed values)
             *
             * @return void
             */
            save () {
                this.sending = true

            	axios.post( '/update-home-feed', {
                    nsfw: this.nsfw,
                    nsfw_media: this.nsfwMedia,
                    exclude_downvoted_submissions: this.exclude_downvoted_submissions,
                    exclude_upvoted_submissions: this.exclude_upvoted_submissions,
                    submission_small_thumbnail: this.submission_small_thumbnail,
                }).then((response) => {
	                this.errors = []
	                this.customError = ''

	                auth.nsfw = this.nsfw
	                auth.nsfwMedia = this.nsfwMedia
                    auth.exclude_upvoted_submissions = this.exclude_upvoted_submissions
	                auth.exclude_downvoted_submissions = this.exclude_downvoted_submissions
	                auth.submission_small_thumbnail = this.submission_small_thumbnail

                    this.sending = false
	            }, (response) => {
	                if(response.status == 500){
	                    this.customError = response.data.error.message
	                    this.errors = []
	                    return
	                }

                    this.sending = false
	                this.errors = response.data
	            })
            },
        }
    };
</script>
