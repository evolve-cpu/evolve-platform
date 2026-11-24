# CTA tracking (GA4)

Every call-to-action on the website and the platform carries a `data-cta` attribute.
One click listener (`initCtaTracking` in `src/utils/analytics.js`, started from `src/main.jsx`)
sends a GA4 event for each click on one of them. Property: **G-MSYRSW4MEH**.

## The event

| Field | Value |
|---|---|
| Event name | `cta_click` |
| `cta_name` | the CTA's name from the list below |
| `cta_platform` | `web` (public website) or `app` (signed-in platform) |
| `cta_text` | the button's visible text |
| `cta_url` | link target, for links |
| `page_path` | page the click happened on |

## Naming

`<web|app>_<page or area>_<what it does>`, all lower case with underscores.

- `web_` = public website (home, pricing, events, mentorship, portfolio review, sign in, ...)
- `app_` = signed-in platform (`/app/*`, onboarding, payment, mentorship session, institute spaces)
- Components that appear in both places (event page, Typetober, profile header, event recordings) pick
  the prefix from the URL, so the same button is `web_event_book_spot` on `/events/:slug` and
  `app_event_book_spot` on `/app/events/:slug`.
- A name with `<...>` in it is a pattern: the part in brackets is filled in from data
  (e.g. `web_events_past_filter_<event category>` → `web_events_past_filter_workshop`).

## GA4 setup (one time)

1. Admin → Custom definitions → Create custom dimension (scope: Event) for `cta_name`,
   `cta_platform` and `cta_text`.
2. Reports: Engagement → Events → `cta_click`, add `cta_name` as the dimension; or Explore →
   free form with Event name = `cta_click` and rows = `cta_name`.
3. To make a single CTA a key event: Admin → Events → Create event, condition
   `event_name = cta_click` AND `cta_name = <name>`, then mark the new event as a key event.
4. In Google Tag Manager (if added later) a CTA can be matched with the CSS selector
   `[data-cta="<name>"]`.

Note: GA also loads on localhost and preview deployments, so filter reports by hostname
(`evolvedesign.academy`) to leave out test clicks.

## Adding a new CTA

Add `data-cta="web_<page>_<action>"` (or `app_...`) to the button or link, and add a row to
this file and `cta-list.csv`. Nothing else is needed.

## Website CTAs (318)

| CTA name | Page / area | Button / action |
|---|---|---|
| `web_404_return_home` | 404 page | Return to Home |
| `web_about_be_a_builder` | About ( /about ) | Be a builder |
| `web_about_be_a_collaborator` | About ( /about ) | Be a collaborator |
| `web_about_builder_linkedin` | About ( /about ) | About builder linkedin |
| `web_about_builder_read_testimonial` | About ( /about ) | About builder read testimonial |
| `web_about_builder_video_play` | About ( /about ) | About builder video play |
| `web_about_team_instagram` | About ( /about ) | About team instagram |
| `web_about_team_linkedin` | About ( /about ) | About team linkedin |
| `web_about_team_member_open` | About ( /about ) | About team member open |
| `web_become_reviewer_join_community` | Become a reviewer ( /portfolio-review/become-a-reviewer ) | Join evolve community |
| `web_become_reviewer_submit` | Become a reviewer ( /portfolio-review/become-a-reviewer ) | Submit |
| `web_community_hero_join_discord` | Community ( /community ) | Community hero join discord |
| `web_community_join_us` | Community ( /community ) | Join Us |
| `web_community_meetups_join_us` | Community ( /community ) | Join Us |
| `web_community_showcase_tab_activities` | Community ( /community ) | Community showcase tab activities |
| `web_community_showcase_tab_ama` | Community ( /community ) | Community showcase tab ama |
| `web_community_showcase_tab_bookclub` | Community ( /community ) | Community showcase tab bookclub |
| `web_contact_modal_send_message` | Contact us pop-up | [Send message] |
| `web_cookie_accept` | Cookie banner | Accept cookies |
| `web_cookie_privacy_policy` | Cookie banner | Privacy policy |
| `web_cookie_reject` | Cookie banner | Reject cookies |
| `web_corporates_download_handbook` | Corporates ( /corporates ) | Download handbook |
| `web_corporates_get_in_touch` | Corporates ( /corporates ) | Get in touch |
| `web_course_open_course` | Course ( /course ) | 🚀 Open Course |
| `web_course_start_now` | Course ( /course ) | Start Now |
| `web_designers_explore_community` | Designers ( /designers ) | Explore evolve community |
| `web_designers_testimonial_video_play` | Designers ( /designers ) | Designers testimonial video play |
| `web_designers_waitlist_be_first_to_know` | Designers ( /designers ) | Be the first to know |
| `web_designers_waitlist_notify_me` | Designers ( /designers ) | notify me |
| `web_event_back_to_events` | Event page ( /events/:slug and /app/events/:slug ) | Back to events |
| `web_event_book_spot` | Event page ( /events/:slug and /app/events/:slug ) | Event book spot |
| `web_event_book_spot_mobile` | Event page ( /events/:slug and /app/events/:slug ) | Event book spot mobile |
| `web_event_free_with_plan` | Event page ( /events/:slug and /app/events/:slug ) | free with a plan |
| `web_event_host_behance` | Event page ( /events/:slug and /app/events/:slug ) | Event host behance |
| `web_event_host_dribbble` | Event page ( /events/:slug and /app/events/:slug ) | Event host dribbble |
| `web_event_host_github` | Event page ( /events/:slug and /app/events/:slug ) | Event host github |
| `web_event_host_instagram` | Event page ( /events/:slug and /app/events/:slug ) | Event host instagram |
| `web_event_host_linkedin` | Event page ( /events/:slug and /app/events/:slug ) | Event host linkedin |
| `web_event_host_twitter` | Event page ( /events/:slug and /app/events/:slug ) | Event host twitter |
| `web_event_host_website` | Event page ( /events/:slug and /app/events/:slug ) | Event host website |
| `web_event_host_youtube` | Event page ( /events/:slug and /app/events/:slug ) | Event host youtube |
| `web_event_register_submit` | Event page ( /events/:slug and /app/events/:slug ) | Event register submit |
| `web_event_register_terms_link` | Event page ( /events/:slug and /app/events/:slug ) | Event register terms link |
| `web_event_speaker_behance` | Event page ( /events/:slug and /app/events/:slug ) | Event speaker behance |
| `web_event_speaker_dribbble` | Event page ( /events/:slug and /app/events/:slug ) | Event speaker dribbble |
| `web_event_speaker_github` | Event page ( /events/:slug and /app/events/:slug ) | Event speaker github |
| `web_event_speaker_instagram` | Event page ( /events/:slug and /app/events/:slug ) | Event speaker instagram |
| `web_event_speaker_linkedin` | Event page ( /events/:slug and /app/events/:slug ) | Event speaker linkedin |
| `web_event_speaker_twitter` | Event page ( /events/:slug and /app/events/:slug ) | Event speaker twitter |
| `web_event_speaker_website` | Event page ( /events/:slug and /app/events/:slug ) | Event speaker website |
| `web_event_speaker_youtube` | Event page ( /events/:slug and /app/events/:slug ) | Event speaker youtube |
| `web_event_ticket_join_community` | Event page ( /events/:slug and /app/events/:slug ) | ⚡ join evolve community |
| `web_event_ticket_save` | Event page ( /events/:slug and /app/events/:slug ) | ↓ save ticket to share |
| `web_event_recording_play` | Event page: past event recording | Event recording play |
| `web_event_recording_unlock` | Event page: past event recording | Event recording unlock |
| `web_events_hero_next` | Events ( /events ) | Events hero next |
| `web_events_hero_prev` | Events ( /events ) | Events hero prev |
| `web_events_past_event_card` | Events ( /events ) | Events past event card |
| `web_events_past_filter` | Events ( /events ) | [filter by category] |
| `web_events_past_filter_<event category>` | Events ( /events ) | Events past filter <event category> |
| `web_events_past_filter_all` | Events ( /events ) | Events past filter all |
| `web_events_past_show_more` | Events ( /events ) | Show more |
| `web_events_upcoming_register_now` | Events ( /events ) | Register now |
| `web_events_watch_playlist` | Events ( /events ) | Events watch playlist |
| `web_events_watch_playlist_mobile` | Events ( /events ) | Events watch playlist mobile |
| `web_inquiry_corporates_book_call` | Get in touch / handbook pop-up (institutions, corporates, programmes) | Book a 30-min call |
| `web_inquiry_corporates_submit` | Get in touch / handbook pop-up (institutions, corporates, programmes) | Inquiry corporates submit |
| `web_inquiry_corporates_submit_download_handbook` | Get in touch / handbook pop-up (institutions, corporates, programmes) | Inquiry corporates submit download handbook |
| `web_inquiry_corporates_whatsapp` | Get in touch / handbook pop-up (institutions, corporates, programmes) | Or message us on whatsapp |
| `web_inquiry_find_your_niche_book_call` | Get in touch / handbook pop-up (institutions, corporates, programmes) | Book a 30-min call |
| `web_inquiry_find_your_niche_submit` | Get in touch / handbook pop-up (institutions, corporates, programmes) | Inquiry find your niche submit |
| `web_inquiry_find_your_niche_submit_download_handbook` | Get in touch / handbook pop-up (institutions, corporates, programmes) | Inquiry find your niche submit download handbook |
| `web_inquiry_find_your_niche_whatsapp` | Get in touch / handbook pop-up (institutions, corporates, programmes) | Or message us on whatsapp |
| `web_inquiry_institutions_book_call` | Get in touch / handbook pop-up (institutions, corporates, programmes) | Book a 30-min call |
| `web_inquiry_institutions_submit` | Get in touch / handbook pop-up (institutions, corporates, programmes) | Inquiry institutions submit |
| `web_inquiry_institutions_submit_download_handbook` | Get in touch / handbook pop-up (institutions, corporates, programmes) | Inquiry institutions submit download handbook |
| `web_inquiry_institutions_whatsapp` | Get in touch / handbook pop-up (institutions, corporates, programmes) | Or message us on whatsapp |
| `web_inquiry_portfolio_review_book_call` | Get in touch / handbook pop-up (institutions, corporates, programmes) | Book a 30-min call |
| `web_inquiry_portfolio_review_submit` | Get in touch / handbook pop-up (institutions, corporates, programmes) | Inquiry portfolio review submit |
| `web_inquiry_portfolio_review_submit_download_handbook` | Get in touch / handbook pop-up (institutions, corporates, programmes) | Inquiry portfolio review submit download handbook |
| `web_inquiry_portfolio_review_whatsapp` | Get in touch / handbook pop-up (institutions, corporates, programmes) | Or message us on whatsapp |
| `web_home_closing_start_for_free` | Home ( / ) | Start for free |
| `web_home_ecosystem_community_explore` | Home ( / ) | Home ecosystem community explore |
| `web_home_ecosystem_events_explore` | Home ( / ) | Home ecosystem events explore |
| `web_home_ecosystem_grow_explore` | Home ( / ) | Home ecosystem grow explore |
| `web_home_ecosystem_profile_explore` | Home ( / ) | Home ecosystem profile explore |
| `web_home_ecosystem_tab_community` | Home ( / ) | Home ecosystem tab community |
| `web_home_ecosystem_tab_events` | Home ( / ) | Home ecosystem tab events |
| `web_home_ecosystem_tab_grow` | Home ( / ) | Home ecosystem tab grow |
| `web_home_ecosystem_tab_profile` | Home ( / ) | Home ecosystem tab profile |
| `web_home_guidance_mentorship_know_more` | Home ( / ) | Know more |
| `web_home_guidance_portfolio_review_know_more` | Home ( / ) | Know more |
| `web_home_hero_scroll_down` | Home ( / ) | Home hero scroll down |
| `web_home_hero_start_for_free` | Home ( / ) | Start for free |
| `web_home_testimonial_video_play` | Home ( / ) | Home testimonial video play |
| `web_invite_accept_continue` | Institute invite ( /invite/:token ) | Invite accept continue |
| `web_invite_confirm_enter_space` | Institute invite ( /invite/:token ) | confirm & enter my space → |
| `web_invite_flag_issue` | Institute invite ( /invite/:token ) | doesn't look right? flag it |
| `web_invite_go_to_institute` | Institute invite ( /invite/:token ) | Invite go to institute |
| `web_invite_intake_continue` | Institute invite ( /invite/:token ) | continue → |
| `web_invite_sign_in_to_accept` | Institute invite ( /invite/:token ) | Invite sign in to accept |
| `web_find_your_niche_programme_download_handbook` | Institute programme pages ( /for-institutes/* ) | Download handbook |
| `web_find_your_niche_programme_get_in_touch` | Institute programme pages ( /for-institutes/* ) | Get in touch |
| `web_find_your_niche_programme_reviewer_instagram` | Institute programme pages ( /for-institutes/* ) | Find your niche programme reviewer instagram |
| `web_find_your_niche_programme_reviewer_linkedin` | Institute programme pages ( /for-institutes/* ) | Find your niche programme reviewer linkedin |
| `web_portfolio_review_programme_download_handbook` | Institute programme pages ( /for-institutes/* ) | Download handbook |
| `web_portfolio_review_programme_get_in_touch` | Institute programme pages ( /for-institutes/* ) | Get in touch |
| `web_portfolio_review_programme_reviewer_instagram` | Institute programme pages ( /for-institutes/* ) | Portfolio review programme reviewer instagram |
| `web_portfolio_review_programme_reviewer_linkedin` | Institute programme pages ( /for-institutes/* ) | Portfolio review programme reviewer linkedin |
| `web_institutions_download_handbook` | Institutions ( /institutions ) | Download handbook |
| `web_institutions_get_in_touch` | Institutions ( /institutions ) | Get in touch |
| `web_institutions_go_to_my_space` | Institutions ( /institutions ) | Institutions go to my space |
| `web_institutions_programme_find_your_niche` | Institutions ( /institutions ) | Institutions programme find your niche |
| `web_institutions_programme_portfolio_review_programme` | Institutions ( /institutions ) | Institutions programme portfolio review programme |
| `web_institutions_set_up_space` | Institutions ( /institutions ) | Institutions set up space |
| `web_audience_footer_corporates` | Institutions / corporates footer | Audience footer corporates |
| `web_audience_footer_designers` | Institutions / corporates footer | Audience footer designers |
| `web_audience_footer_find_your_niche_programme` | Institutions / corporates footer | Audience footer find your niche programme |
| `web_audience_footer_institutions` | Institutions / corporates footer | Audience footer institutions |
| `web_audience_footer_portfolio_review_programme` | Institutions / corporates footer | Audience footer portfolio review programme |
| `web_audience_footer_privacy_policy` | Institutions / corporates footer | Privacy Policy |
| `web_audience_footer_social_discord` | Institutions / corporates footer | Audience footer social discord |
| `web_audience_footer_social_instagram` | Institutions / corporates footer | Audience footer social instagram |
| `web_audience_footer_social_linkedin` | Institutions / corporates footer | Audience footer social linkedin |
| `web_audience_footer_social_medium` | Institutions / corporates footer | Audience footer social medium |
| `web_audience_footer_social_youtube` | Institutions / corporates footer | Audience footer social youtube |
| `web_audience_footer_terms` | Institutions / corporates footer | Terms & Conditions |
| `web_corporates_footer_get_in_touch` | Institutions / corporates footer | Corporates footer get in touch |
| `web_institutions_footer_get_in_touch` | Institutions / corporates footer | Institutions footer get in touch |
| `web_audience_nav_corporates` | Institutions / corporates navigation | Audience nav corporates |
| `web_audience_nav_designers` | Institutions / corporates navigation | Audience nav designers |
| `web_audience_nav_institutions` | Institutions / corporates navigation | Audience nav institutions |
| `web_audience_nav_logo` | Institutions / corporates navigation | [evolve home] |
| `web_corporates_nav_get_in_touch` | Institutions / corporates navigation | Get in Touch |
| `web_institutions_nav_get_in_touch` | Institutions / corporates navigation | Get in Touch |
| `web_mentorship_hero_explore` | Mentorship ( /mentorship ) | Coming Soon → |
| `web_mentorship_hero_get_started` | Mentorship ( /mentorship ) | Mentorship hero get started |
| `web_mentorship_how_it_works` | Mentorship ( /mentorship ) | See how it works |
| `web_mentorship_mentor_linkedin` | Mentorship ( /mentorship ) | Mentorship mentor linkedin |
| `web_mentorship_my_session` | Mentorship ( /mentorship ) | my mentorship session |
| `web_mentorship_pricing_core_get_started` | Mentorship ( /mentorship ) | [Core Mentorship] |
| `web_mentorship_pricing_job_assistance_get_started` | Mentorship ( /mentorship ) | [Mentorship + Job Assistance] |
| `web_mentorship_whatsapp_connect` | Mentorship ( /mentorship ) | Connect with us |
| `web_mentorship_why_we_built_this_get_started` | Mentorship ( /mentorship ) | Mentorship why we built this get started |
| `web_nav_logo` | Navigation on mentorship session & payment pages ; Site navigation (all website pages) | Nav logo |
| `web_nav_menu_community` | Navigation on mentorship session & payment pages ; Site navigation (all website pages) | Nav menu community |
| `web_nav_menu_contact_us` | Navigation on mentorship session & payment pages ; Site navigation (all website pages) | Nav menu contact us |
| `web_nav_menu_events` | Navigation on mentorship session & payment pages ; Site navigation (all website pages) | Nav menu events |
| `web_nav_menu_home` | Navigation on mentorship session & payment pages ; Site navigation (all website pages) | Nav menu home |
| `web_nav_menu_join_discord` | Navigation on mentorship session & payment pages | Nav menu join discord |
| `web_nav_menu_mentorship` | Navigation on mentorship session & payment pages | Nav menu mentorship |
| `web_nav_menu_toggle` | Navigation on mentorship session & payment pages ; Site navigation (all website pages) | [open menu] |
| `web_profile_header_avatar` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | Profile header avatar |
| `web_profile_header_discord` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | Evolve community |
| `web_profile_header_logo` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | Profile header logo |
| `web_profile_header_sign_in` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | Sign in |
| `web_profile_tab_grow` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | Profile tab grow |
| `web_profile_tab_profile` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | Profile tab profile |
| `web_portfolio_review_become_a_reviewer` | Portfolio review ( /portfolio-review ) | Become a reviewer |
| `web_portfolio_review_get_started_benefits_desktop` | Portfolio review ( /portfolio-review ) | Get Started |
| `web_portfolio_review_get_started_benefits_mobile` | Portfolio review ( /portfolio-review ) | Get Started |
| `web_portfolio_review_get_started_hero_desktop` | Portfolio review ( /portfolio-review ) | Get Started |
| `web_portfolio_review_get_started_hero_mobile` | Portfolio review ( /portfolio-review ) | Get Started |
| `web_portfolio_review_get_started_pricing_desktop` | Portfolio review ( /portfolio-review ) | Get Started |
| `web_portfolio_review_get_started_pricing_mobile` | Portfolio review ( /portfolio-review ) | Get Started |
| `web_portfolio_review_reviewer_instagram` | Portfolio review ( /portfolio-review ) | Portfolio review reviewer instagram |
| `web_portfolio_review_reviewer_linkedin` | Portfolio review ( /portfolio-review ) | Portfolio review reviewer linkedin |
| `web_portfolio_review_form_paste_link` | Portfolio review form ( /portfolio-review/form ) | paste a link |
| `web_portfolio_review_form_submit` | Portfolio review form ( /portfolio-review/form ) | Portfolio review form submit |
| `web_portfolio_review_form_success_apply_mentorship` | Portfolio review form ( /portfolio-review/form ) | apply for mentorship |
| `web_portfolio_review_form_success_back_to_community` | Portfolio review form ( /portfolio-review/form ) | Portfolio review form success back to community |
| `web_portfolio_review_form_upload_file` | Portfolio review form ( /portfolio-review/form ) | upload a file |
| `web_pricing_free_continue` | Pricing ( /pricing ) | Pricing free continue |
| `web_pricing_pro_annual_extend` | Pricing ( /pricing ) | Pricing pro annual extend |
| `web_pricing_pro_annual_subscribe` | Pricing ( /pricing ) | Pricing pro annual subscribe |
| `web_pricing_pro_billing_annual` | Pricing ( /pricing ) | Pricing pro billing annual |
| `web_pricing_pro_billing_monthly` | Pricing ( /pricing ) | Pricing pro billing monthly |
| `web_pricing_pro_monthly_extend` | Pricing ( /pricing ) | Pricing pro monthly extend |
| `web_pricing_pro_monthly_subscribe` | Pricing ( /pricing ) | Pricing pro monthly subscribe |
| `web_pricing_student_annual_extend` | Pricing ( /pricing ) | Pricing student annual extend |
| `web_pricing_student_annual_subscribe` | Pricing ( /pricing ) | Pricing student annual subscribe |
| `web_pricing_student_billing_annual` | Pricing ( /pricing ) | Pricing student billing annual |
| `web_pricing_student_billing_monthly` | Pricing ( /pricing ) | Pricing student billing monthly |
| `web_pricing_student_monthly_extend` | Pricing ( /pricing ) | Pricing student monthly extend |
| `web_pricing_student_monthly_subscribe` | Pricing ( /pricing ) | Pricing student monthly subscribe |
| `web_profile_link_portfolio` | Profile & account ( /app/profile, /app/account ) | Profile link portfolio |
| `web_profile_link_resume` | Profile & account ( /app/profile, /app/account ) | Profile link resume |
| `web_profile_portfolio` | Profile & account ( /app/profile, /app/account ) | [Portfolio] |
| `web_profile_resume` | Profile & account ( /app/profile, /app/account ) | [Resume] |
| `web_profile_social_link` | Profile & account ( /app/profile, /app/account ) | Profile social link |
| `web_profile_creation_build_verified_profile` | Profile creation ( /profile-creation ) | Build Your Verified Profile |
| `web_quiz_printing_start` | Quiz ( /quiz ) | Start Quiz |
| `web_quiz_random_start` | Quiz ( /quiz ) | Take Random Quiz |
| `web_quiz_story_start` | Quiz ( /quiz ) | Start Quiz |
| `web_signin_confirm_code` | Sign in ( /signin ) | Confirm |
| `web_signin_continue_email` | Sign in ( /signin ) | Signin continue email |
| `web_signin_continue_google` | Sign in ( /signin ) | Signin continue google |
| `web_signin_continue_linkedin` | Sign in ( /signin ) | Signin continue linkedin |
| `web_signin_resend_code` | Sign in ( /signin ) | Resend code |
| `web_signin_send_code` | Sign in ( /signin ) | Send code |
| `web_auth_modal_continue_google` | Sign-in pop-up | Auth modal continue google |
| `web_auth_modal_resend_code` | Sign-in pop-up | Resend code |
| `web_auth_modal_send_code` | Sign-in pop-up | Auth modal send code |
| `web_auth_modal_verify_code` | Sign-in pop-up | Auth modal verify code |
| `web_footer_about` | Site footer | Footer about |
| `web_footer_community` | Site footer | Footer community |
| `web_footer_contact_us` | Site footer | Footer contact us |
| `web_footer_corporates` | Site footer | Footer corporates |
| `web_footer_events` | Site footer | Footer events |
| `web_footer_grow` | Site footer | Footer grow |
| `web_footer_home` | Site footer | Footer home |
| `web_footer_institutions` | Site footer | Footer institutions |
| `web_footer_mentorship` | Site footer | Footer mentorship |
| `web_footer_portfolio_review` | Site footer | Footer portfolio review |
| `web_footer_pricing` | Site footer | Footer pricing |
| `web_footer_privacy_policy` | Site footer | Privacy Policy |
| `web_footer_profile_creation` | Site footer | Footer profile creation |
| `web_footer_social_discord` | Site footer | Footer social discord |
| `web_footer_social_instagram` | Site footer | Footer social instagram |
| `web_footer_social_linkedin` | Site footer | Footer social linkedin |
| `web_footer_social_medium` | Site footer | Footer social medium |
| `web_footer_social_youtube` | Site footer | Footer social youtube |
| `web_footer_start_for_free` | Site footer | Start for free |
| `web_footer_terms` | Site footer | Terms & Conditions |
| `web_nav_account` | Site navigation (all website pages) | Nav account |
| `web_nav_account_complete_profile` | Site navigation (all website pages) | Complete your profile |
| `web_nav_account_download_receipt` | Site navigation (all website pages) | download receipt ↓ |
| `web_nav_account_log_out` | Site navigation (all website pages) | Log out |
| `web_nav_account_my_profile` | Site navigation (all website pages) | My profile page |
| `web_nav_menu_about` | Site navigation (all website pages) | Nav menu about |
| `web_nav_menu_grow` | Site navigation (all website pages) | Nav menu grow |
| `web_nav_menu_mentorship_programme` | Site navigation (all website pages) | Nav menu mentorship programme |
| `web_nav_menu_portfolio_review` | Site navigation (all website pages) | Nav menu portfolio review |
| `web_nav_menu_pricing` | Site navigation (all website pages) | Nav menu pricing |
| `web_nav_menu_profile_creation` | Site navigation (all website pages) | Nav menu profile creation |
| `web_nav_menu_typetober` | Site navigation (all website pages) | Nav menu typetober |
| `web_nav_sign_in` | Site navigation (all website pages) | Nav sign in |
| `web_typetober_add_letter` | Typetober ( /typetober and /app/typetober ) | Typetober add letter |
| `web_typetober_bulk_add_more` | Typetober ( /typetober and /app/typetober ) | Add more |
| `web_typetober_bulk_choose_images` | Typetober ( /typetober and /app/typetober ) | Choose images |
| `web_typetober_bulk_continue` | Typetober ( /typetober and /app/typetober ) | Typetober bulk continue |
| `web_typetober_bulk_currency_inr` | Typetober ( /typetober and /app/typetober ) | Typetober bulk currency inr |
| `web_typetober_bulk_currency_usd` | Typetober ( /typetober and /app/typetober ) | Typetober bulk currency usd |
| `web_typetober_bulk_pay_submit` | Typetober ( /typetober and /app/typetober ) | Typetober bulk pay submit |
| `web_typetober_bulk_see_on_wall` | Typetober ( /typetober and /app/typetober ) | See them on the wall |
| `web_typetober_bulk_upload_fab` | Typetober ( /typetober and /app/typetober ) | Bulk upload |
| `web_typetober_example_view` | Typetober ( /typetober and /app/typetober ) | Typetober example view |
| `web_typetober_hero_accept_challenge` | Typetober ( /typetober and /app/typetober ) | Typetober hero accept challenge |
| `web_typetober_hero_see_gallery` | Typetober ( /typetober and /app/typetober ) | Typetober hero see gallery |
| `web_typetober_hero_vote_now` | Typetober ( /typetober and /app/typetober ) | Typetober hero vote now |
| `web_typetober_info_tab_faqs` | Typetober ( /typetober and /app/typetober ) | Typetober info tab faqs |
| `web_typetober_info_tab_guidelines` | Typetober ( /typetober and /app/typetober ) | Typetober info tab guidelines |
| `web_typetober_letter_share` | Typetober ( /typetober and /app/typetober ) | Share this letter |
| `web_typetober_letter_tab` | Typetober ( /typetober and /app/typetober ) | Typetober letter tab |
| `web_typetober_letter_take_challenge` | Typetober ( /typetober and /app/typetober ) | Take the challenge |
| `web_typetober_my_letter_view` | Typetober ( /typetober and /app/typetober ) | Typetober my letter view |
| `web_typetober_nav_back_to_platform` | Typetober ( /typetober and /app/typetober ) | [back to my platform] |
| `web_typetober_nav_guidelines` | Typetober ( /typetober and /app/typetober ) | [Guidelines] |
| `web_typetober_nav_join_community` | Typetober ( /typetober and /app/typetober ) | [Join community] |
| `web_typetober_nav_menu_about` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu about |
| `web_typetober_nav_menu_community` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu community |
| `web_typetober_nav_menu_contact_us` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu contact us |
| `web_typetober_nav_menu_events` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu events |
| `web_typetober_nav_menu_grow` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu grow |
| `web_typetober_nav_menu_home` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu home |
| `web_typetober_nav_menu_mentorship_programme` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu mentorship programme |
| `web_typetober_nav_menu_portfolio_review` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu portfolio review |
| `web_typetober_nav_menu_pricing` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu pricing |
| `web_typetober_nav_menu_profile_creation` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu profile creation |
| `web_typetober_nav_menu_toggle` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu toggle |
| `web_typetober_nav_menu_typetober` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu typetober |
| `web_typetober_nav_prizes` | Typetober ( /typetober and /app/typetober ) | [Prizes] |
| `web_typetober_nav_profile` | Typetober ( /typetober and /app/typetober ) | Typetober nav profile |
| `web_typetober_profile_bulk_upload` | Typetober ( /typetober and /app/typetober ) | Bulk upload |
| `web_typetober_profile_download_certificate` | Typetober ( /typetober and /app/typetober ) | Download certificate |
| `web_typetober_profile_go_to_letter` | Typetober ( /typetober and /app/typetober ) | Typetober profile go to letter |
| `web_typetober_profile_sign_out` | Typetober ( /typetober and /app/typetober ) | Sign out |
| `web_typetober_profile_tab_certs` | Typetober ( /typetober and /app/typetober ) | Typetober profile tab certs |
| `web_typetober_profile_tab_subs` | Typetober ( /typetober and /app/typetober ) | Typetober profile tab subs |
| `web_typetober_profile_view_letter` | Typetober ( /typetober and /app/typetober ) | Typetober profile view letter |
| `web_typetober_share_copy_caption` | Typetober ( /typetober and /app/typetober ) | Typetober share copy caption |
| `web_typetober_share_copy_link` | Typetober ( /typetober and /app/typetober ) | Typetober share copy link |
| `web_typetober_share_discord_join` | Typetober ( /typetober and /app/typetober ) | Join |
| `web_typetober_share_instagram` | Typetober ( /typetober and /app/typetober ) | Typetober share instagram |
| `web_typetober_share_native` | Typetober ( /typetober and /app/typetober ) | Share |
| `web_typetober_share_save_image` | Typetober ( /typetober and /app/typetober ) | Save image |
| `web_typetober_share_whatsapp` | Typetober ( /typetober and /app/typetober ) | Typetober share whatsapp |
| `web_typetober_share_x` | Typetober ( /typetober and /app/typetober ) | Typetober share x |
| `web_typetober_signin_email` | Typetober ( /typetober and /app/typetober ) | Typetober signin email |
| `web_typetober_signin_google` | Typetober ( /typetober and /app/typetober ) | Typetober signin google |
| `web_typetober_signin_linkedin` | Typetober ( /typetober and /app/typetober ) | Typetober signin linkedin |
| `web_typetober_signin_resend_code` | Typetober ( /typetober and /app/typetober ) | Resend code |
| `web_typetober_signin_send_code` | Typetober ( /typetober and /app/typetober ) | Send me a code |
| `web_typetober_signin_verify_code` | Typetober ( /typetober and /app/typetober ) | Verify & continue |
| `web_typetober_upload_choose_image` | Typetober ( /typetober and /app/typetober ) | Typetober upload choose image |
| `web_typetober_upload_continue` | Typetober ( /typetober and /app/typetober ) | Continue → |
| `web_typetober_upload_currency_inr` | Typetober ( /typetober and /app/typetober ) | Typetober upload currency inr |
| `web_typetober_upload_currency_usd` | Typetober ( /typetober and /app/typetober ) | Typetober upload currency usd |
| `web_typetober_upload_pay_submit` | Typetober ( /typetober and /app/typetober ) | Typetober upload pay submit |
| `web_typetober_upload_see_on_wall` | Typetober ( /typetober and /app/typetober ) | See it on the wall |
| `web_typetober_upload_switch_to_bulk` | Typetober ( /typetober and /app/typetober ) | Upload many at once |
| `web_typetober_upload_take_photo` | Typetober ( /typetober and /app/typetober ) | Take photo |
| `web_typetober_vote` | Typetober ( /typetober and /app/typetober ) | Typetober vote |
| `web_typetober_wall_entry_view` | Typetober ( /typetober and /app/typetober ) | Typetober wall entry view |
| `web_in_person_activity_start_reality_check` | evolve in person ( /evolve-in-person/* ) | In person activity start reality check |
| `web_in_person_activity_start_self_reflection` | evolve in person ( /evolve-in-person/* ) | In person activity start self reflection |
| `web_in_person_edit_details` | evolve in person ( /evolve-in-person/* ) | edit details / edit |
| `web_in_person_reality_check_add_answer` | evolve in person ( /evolve-in-person/* ) | add answer |
| `web_in_person_reality_check_back_to_activities` | evolve in person ( /evolve-in-person/* ) | back to activities |
| `web_in_person_reality_check_begin` | evolve in person ( /evolve-in-person/* ) | begin |
| `web_in_person_reality_check_save_major_start` | evolve in person ( /evolve-in-person/* ) | next |
| `web_in_person_reflection_add_field` | evolve in person ( /evolve-in-person/* ) | add this field |
| `web_in_person_reflection_add_more` | evolve in person ( /evolve-in-person/* ) | add more |
| `web_in_person_reflection_save_finish` | evolve in person ( /evolve-in-person/* ) | save & finish |
| `web_in_person_resend_code` | evolve in person ( /evolve-in-person/* ) | resend otp / resend |
| `web_in_person_send_code` | evolve in person ( /evolve-in-person/* ) | lets begin |
| `web_in_person_verify_code` | evolve in person ( /evolve-in-person/* ) | verify otp |
| `web_in_person_verify_continue` | evolve in person ( /evolve-in-person/* ) | continue |

## Platform CTAs (401)

| CTA name | Page / area | Button / action |
|---|---|---|
| `app_community_channel_<discord channel id>` | Community tab ( /app/community ) | Community channel <discord channel id> |
| `app_community_channel_all` | Community tab ( /app/community ) | Community channel all |
| `app_community_feed_try_again` | Community tab ( /app/community ) | Try again |
| `app_community_join_discord` | Community tab ( /app/community ) | Join |
| `app_community_reply_on_discord` | Community tab ( /app/community ) | Reply on Discord → |
| `app_event_all_events` | Event page ( /events/:slug and /app/events/:slug ) | ← all events |
| `app_event_back_to_events` | Event page ( /events/:slug and /app/events/:slug ) | Back to events |
| `app_event_book_spot` | Event page ( /events/:slug and /app/events/:slug ) | Event book spot |
| `app_event_book_spot_mobile` | Event page ( /events/:slug and /app/events/:slug ) | Event book spot mobile |
| `app_event_free_with_plan` | Event page ( /events/:slug and /app/events/:slug ) | free with a plan |
| `app_event_host_behance` | Event page ( /events/:slug and /app/events/:slug ) | Event host behance |
| `app_event_host_dribbble` | Event page ( /events/:slug and /app/events/:slug ) | Event host dribbble |
| `app_event_host_github` | Event page ( /events/:slug and /app/events/:slug ) | Event host github |
| `app_event_host_instagram` | Event page ( /events/:slug and /app/events/:slug ) | Event host instagram |
| `app_event_host_linkedin` | Event page ( /events/:slug and /app/events/:slug ) | Event host linkedin |
| `app_event_host_twitter` | Event page ( /events/:slug and /app/events/:slug ) | Event host twitter |
| `app_event_host_website` | Event page ( /events/:slug and /app/events/:slug ) | Event host website |
| `app_event_host_youtube` | Event page ( /events/:slug and /app/events/:slug ) | Event host youtube |
| `app_event_register_submit` | Event page ( /events/:slug and /app/events/:slug ) | Event register submit |
| `app_event_register_terms_link` | Event page ( /events/:slug and /app/events/:slug ) | Event register terms link |
| `app_event_speaker_behance` | Event page ( /events/:slug and /app/events/:slug ) | Event speaker behance |
| `app_event_speaker_dribbble` | Event page ( /events/:slug and /app/events/:slug ) | Event speaker dribbble |
| `app_event_speaker_github` | Event page ( /events/:slug and /app/events/:slug ) | Event speaker github |
| `app_event_speaker_instagram` | Event page ( /events/:slug and /app/events/:slug ) | Event speaker instagram |
| `app_event_speaker_linkedin` | Event page ( /events/:slug and /app/events/:slug ) | Event speaker linkedin |
| `app_event_speaker_twitter` | Event page ( /events/:slug and /app/events/:slug ) | Event speaker twitter |
| `app_event_speaker_website` | Event page ( /events/:slug and /app/events/:slug ) | Event speaker website |
| `app_event_speaker_youtube` | Event page ( /events/:slug and /app/events/:slug ) | Event speaker youtube |
| `app_event_ticket_join_community` | Event page ( /events/:slug and /app/events/:slug ) | ⚡ join evolve community |
| `app_event_ticket_save` | Event page ( /events/:slug and /app/events/:slug ) | ↓ save ticket to share |
| `app_event_recording_play` | Event page: past event recording | Event recording play |
| `app_event_recording_unlock` | Event page: past event recording | Event recording unlock |
| `app_mentorship_back` | Grow > Mentorship ( /app/grow/mentorship ) | Mentorship back |
| `app_mentorship_book_slot_confirm` | Grow > Mentorship ( /app/grow/mentorship ) | Mentorship book slot confirm |
| `app_mentorship_book_slot_continue` | Grow > Mentorship ( /app/grow/mentorship ) | Mentorship book slot continue |
| `app_mentorship_call_go_to_next` | Grow > Mentorship ( /app/grow/mentorship ) | Mentorship call go to next |
| `app_mentorship_docs_<resource title>` | Grow > Mentorship ( /app/grow/mentorship ) | Mentorship docs <resource title> |
| `app_mentorship_docs_fill_up_the_skill_tracker` | Grow > Mentorship ( /app/grow/mentorship ) | Mentorship docs fill up the skill tracker |
| `app_mentorship_docs_fill_up_the_stream_specific_skill_tracker` | Grow > Mentorship ( /app/grow/mentorship ) | Mentorship docs fill up the stream specific skill tracker |
| `app_mentorship_docs_portfolio` | Grow > Mentorship ( /app/grow/mentorship ) | Mentorship docs portfolio |
| `app_mentorship_docs_resume` | Grow > Mentorship ( /app/grow/mentorship ) | Mentorship docs resume |
| `app_mentorship_docs_save` | Grow > Mentorship ( /app/grow/mentorship ) | Save |
| `app_mentorship_explore_plans` | Grow > Mentorship ( /app/grow/mentorship ) | Explore plans |
| `app_mentorship_feedback_did_not_attend` | Grow > Mentorship ( /app/grow/mentorship ) | I did not attend the session |
| `app_mentorship_feedback_submit` | Grow > Mentorship ( /app/grow/mentorship ) | Submit |
| `app_mentorship_get_started` | Grow > Mentorship ( /app/grow/mentorship ) | Get started |
| `app_mentorship_gift_claim` | Grow > Mentorship ( /app/grow/mentorship ) | Claim your gift! |
| `app_mentorship_gift_claim_continue` | Grow > Mentorship ( /app/grow/mentorship ) | Claim your gift! |
| `app_mentorship_intake_continue` | Grow > Mentorship ( /app/grow/mentorship ) | Mentorship intake continue |
| `app_mentorship_intake_portfolio_file` | Grow > Mentorship ( /app/grow/mentorship ) | Upload a file |
| `app_mentorship_intake_portfolio_link` | Grow > Mentorship ( /app/grow/mentorship ) | Paste a link |
| `app_mentorship_join_call` | Grow > Mentorship ( /app/grow/mentorship ) | Join session |
| `app_mentorship_mentor_linkedin` | Grow > Mentorship ( /app/grow/mentorship ) | View LinkedIn |
| `app_mentorship_open_recording` | Grow > Mentorship ( /app/grow/mentorship ) | Open recording ↗ |
| `app_mentorship_payment_retry` | Grow > Mentorship ( /app/grow/mentorship ) | Retry |
| `app_mentorship_payment_success_continue` | Grow > Mentorship ( /app/grow/mentorship ) | Continue → |
| `app_mentorship_payment_try_again` | Grow > Mentorship ( /app/grow/mentorship ) | Try again |
| `app_mentorship_proceed_to_payment` | Grow > Mentorship ( /app/grow/mentorship ) | Proceed to payment → |
| `app_mentorship_recording_play` | Grow > Mentorship ( /app/grow/mentorship ) | Mentorship recording play |
| `app_mentorship_select_plan_application_support` | Grow > Mentorship ( /app/grow/mentorship ) | Get started |
| `app_mentorship_select_plan_core` | Grow > Mentorship ( /app/grow/mentorship ) | Get started |
| `app_mentorship_session_go_to_next` | Grow > Mentorship ( /app/grow/mentorship ) | Mentorship session go to next |
| `app_mentorship_skill_tracker_next` | Grow > Mentorship ( /app/grow/mentorship ) | Mentorship skill tracker next |
| `app_mentorship_skill_tracker_save` | Grow > Mentorship ( /app/grow/mentorship ) | Save skill tracker |
| `app_mentorship_team_email` | Grow > Mentorship ( /app/grow/mentorship ) | Mentorship team email |
| `app_mentorship_timeline_all_recordings` | Grow > Mentorship ( /app/grow/mentorship ) | Mentorship timeline all recordings |
| `app_mentorship_workspace_back` | Grow > Mentorship ( /app/grow/mentorship ) | Mentorship workspace back |
| `app_portfolio_review_back` | Grow > Portfolio review ( /app/grow/portfolio-review ) | Portfolio review back |
| `app_portfolio_review_book_free_review` | Grow > Portfolio review ( /app/grow/portfolio-review ) | Portfolio review book free review |
| `app_portfolio_review_get_started_bottom` | Grow > Portfolio review ( /app/grow/portfolio-review ) | Get started → |
| `app_portfolio_review_get_started_hero` | Grow > Portfolio review ( /app/grow/portfolio-review ) | Get started → |
| `app_portfolio_review_get_started_pricing` | Grow > Portfolio review ( /app/grow/portfolio-review ) | Get started → |
| `app_portfolio_review_join_waitlist` | Grow > Portfolio review ( /app/grow/portfolio-review ) | Join the waitlist → |
| `app_portfolio_review_payment_retry` | Grow > Portfolio review ( /app/grow/portfolio-review ) | Retry |
| `app_portfolio_review_payment_try_again` | Grow > Portfolio review ( /app/grow/portfolio-review ) | Try again |
| `app_portfolio_review_proceed_to_pay` | Grow > Portfolio review ( /app/grow/portfolio-review ) | Portfolio review proceed to pay |
| `app_portfolio_review_see_whats_included` | Grow > Portfolio review ( /app/grow/portfolio-review ) | See what's included |
| `app_portfolio_review_start_your_review` | Grow > Portfolio review ( /app/grow/portfolio-review ) | Start your review → |
| `app_growth_stage_keep_going` | Growth stage pop-up | Keep going → |
| `app_space_back_to_evolve` | Institute / company space ( /institute/:slug ) | back to evolve |
| `app_space_calendar_add_event` | Institute / company space ( /institute/:slug ) | + add new event |
| `app_space_calendar_edit` | Institute / company space ( /institute/:slug ) | [edit calendar] |
| `app_space_calendar_save` | Institute / company space ( /institute/:slug ) | save changes |
| `app_space_feed_approve_post` | Institute / company space ( /institute/:slug ) | ✓ approve |
| `app_space_feed_edit_post` | Institute / company space ( /institute/:slug ) | edit post |
| `app_space_feed_new_post` | Institute / company space ( /institute/:slug ) | + post |
| `app_space_feed_reject_post` | Institute / company space ( /institute/:slug ) | ✕ reject |
| `app_space_feed_remove_post` | Institute / company space ( /institute/:slug ) | remove from feed |
| `app_space_feed_view_pending` | Institute / company space ( /institute/:slug ) | Space feed view pending |
| `app_space_feed_view_posts` | Institute / company space ( /institute/:slug ) | Space feed view posts |
| `app_space_feed_view_source` | Institute / company space ( /institute/:slug ) | view source ↗ |
| `app_space_nav_evolve_community` | Institute / company space ( /institute/:slug ) | evolve community |
| `app_space_nav_my_profile` | Institute / company space ( /institute/:slug ) | Space nav my profile |
| `app_space_nav_settings` | Institute / company space ( /institute/:slug ) | [space settings] |
| `app_space_post_publish` | Institute / company space ( /institute/:slug ) | Space post publish |
| `app_space_post_save_changes` | Institute / company space ( /institute/:slug ) | Space post save changes |
| `app_space_post_submit_for_review` | Institute / company space ( /institute/:slug ) | Space post submit for review |
| `app_space_programme_edit_what_we_do` | Institute / company space ( /institute/:slug ) | edit "what we do" → |
| `app_space_programme_save` | Institute / company space ( /institute/:slug ) | save changes |
| `app_space_programs_explore` | Institute / company space ( /institute/:slug ) | explore program |
| `app_space_programs_request_tailored` | Institute / company space ( /institute/:slug ) | ✎ |
| `app_space_programs_send_request` | Institute / company space ( /institute/:slug ) | send request |
| `app_space_settings_add_award` | Institute / company space ( /institute/:slug ) | + add award |
| `app_space_settings_add_link` | Institute / company space ( /institute/:slug ) | + add link |
| `app_space_settings_save` | Institute / company space ( /institute/:slug ) | save / save changes |
| `app_space_tab_calendar` | Institute / company space ( /institute/:slug ) | Space tab calendar |
| `app_space_tab_feed` | Institute / company space ( /institute/:slug ) | Space tab feed |
| `app_space_tab_programs` | Institute / company space ( /institute/:slug ) | Space tab programs |
| `app_space_tab_team` | Institute / company space ( /institute/:slug ) | Space tab team |
| `app_space_team_add_one` | Institute / company space ( /institute/:slug ) | + |
| `app_space_team_find_on_evolve` | Institute / company space ( /institute/:slug ) | ⌕ |
| `app_space_team_quick_invite` | Institute / company space ( /institute/:slug ) | invite |
| `app_space_team_remove_member` | Institute / company space ( /institute/:slug ) | Space team remove member |
| `app_space_team_save_add_another` | Institute / company space ( /institute/:slug ) | + save & add another |
| `app_space_team_send_csv_invites` | Institute / company space ( /institute/:slug ) | Space team send csv invites |
| `app_space_team_send_find_invites` | Institute / company space ( /institute/:slug ) | send invites |
| `app_space_team_send_invite` | Institute / company space ( /institute/:slug ) | send invite |
| `app_space_team_upload_csv` | Institute / company space ( /institute/:slug ) | ⇧ |
| `app_space_testimonials_add` | Institute / company space ( /institute/:slug ) | Space testimonials add |
| `app_space_testimonials_add_row` | Institute / company space ( /institute/:slug ) | + add new testimonial |
| `app_space_testimonials_edit` | Institute / company space ( /institute/:slug ) | Space testimonials edit |
| `app_space_testimonials_save` | Institute / company space ( /institute/:slug ) | Space testimonials save |
| `app_space_testimonials_share` | Institute / company space ( /institute/:slug ) | Space testimonials share |
| `app_space_info_edit` | Institute space: info panel | Space info edit |
| `app_space_info_link_<link platform>` | Institute space: info panel | Space info link <link platform> |
| `app_space_info_website` | Institute space: info panel | [website] |
| `app_space_settings_browse_programs` | Institute space: settings | browse ongoing programs → |
| `app_space_settings_contact_support` | Institute space: settings | contact support |
| `app_space_settings_copy_space_id` | Institute space: settings | [copy full id] |
| `app_space_settings_delete_confirm` | Institute space: settings | delete space |
| `app_space_settings_delete_open` | Institute space: settings | delete space |
| `app_space_settings_notification_new_member` | Institute space: settings | Space settings notification new member |
| `app_space_settings_notification_new_post_pending` | Institute space: settings | Space settings notification new post pending |
| `app_space_settings_notification_product_updates` | Institute space: settings | Space settings notification product updates |
| `app_space_settings_notification_weekly_analytics` | Institute space: settings | Space settings notification weekly analytics |
| `app_space_settings_restore_space` | Institute space: settings | Space settings restore space |
| `app_space_settings_save_visibility` | Institute space: settings | save changes |
| `app_space_settings_transfer_confirm` | Institute space: settings | transfer |
| `app_space_settings_transfer_continue` | Institute space: settings | continue |
| `app_space_settings_transfer_open` | Institute space: settings | transfer |
| `app_space_settings_visibility_private` | Institute space: settings | Space settings visibility private |
| `app_space_settings_visibility_public` | Institute space: settings | Space settings visibility public |
| `app_payment_back_to_evolve` | Mentorship checkout ( /payment ) | back to evolve |
| `app_payment_batch_continue` | Mentorship checkout ( /payment ) | continue this selection |
| `app_payment_claim_gift` | Mentorship checkout ( /payment ) | claim your gift! |
| `app_payment_claim_gift_continue` | Mentorship checkout ( /payment ) | claim your gift! |
| `app_payment_confirm_and_pay` | Mentorship checkout ( /payment ) | Payment confirm and pay |
| `app_payment_details_continue` | Mentorship checkout ( /payment ) | continue |
| `app_payment_download_receipt` | Mentorship checkout ( /payment ) | download receipt ↓ |
| `app_payment_plan_accelerator` | Mentorship checkout ( /payment ) | Payment plan accelerator |
| `app_payment_plan_starter` | Mentorship checkout ( /payment ) | Payment plan starter |
| `app_payment_see_whats_next` | Mentorship checkout ( /payment ) | see what's next |
| `app_payment_select_batch` | Mentorship checkout ( /payment ) | Payment select batch |
| `app_payment_sign_out` | Mentorship checkout ( /payment ) | sign out |
| `app_payment_terms_link` | Mentorship checkout ( /payment ) | T&Cs |
| `app_payment_waitlist_add_me` | Mentorship checkout ( /payment ) | add me to list |
| `app_session_bonus_book_call` | Mentorship session ( /mentorship-session ) | book a call #FFD007 |
| `app_session_comment_post` | Mentorship session ( /mentorship-session ) | Session comment post |
| `app_session_comment_reply` | Mentorship session ( /mentorship-session ) | reply |
| `app_session_comment_send_reply` | Mentorship session ( /mentorship-session ) | send |
| `app_session_doc_comments` | Mentorship session ( /mentorship-session ) | Session doc comments |
| `app_session_doc_google_sheet` | Mentorship session ( /mentorship-session ) | Session doc google sheet |
| `app_session_doc_portfolio` | Mentorship session ( /mentorship-session ) | Session doc portfolio |
| `app_session_doc_portfolio_review` | Mentorship session ( /mentorship-session ) | Session doc portfolio review |
| `app_session_doc_resume` | Mentorship session ( /mentorship-session ) | Session doc resume |
| `app_session_doc_summary_transcript` | Mentorship session ( /mentorship-session ) | Session doc summary transcript |
| `app_session_download_receipt` | Mentorship session ( /mentorship-session ) | download receipt ↓ |
| `app_session_faq_toggle` | Mentorship session ( /mentorship-session ) | Session faq toggle |
| `app_session_feedback_did_not_attend` | Mentorship session ( /mentorship-session ) | I did not attend the session |
| `app_session_feedback_submit` | Mentorship session ( /mentorship-session ) | submit |
| `app_session_get_started` | Mentorship session ( /mentorship-session ) | get started |
| `app_session_google_sheet` | Mentorship session ( /mentorship-session ) | Session google sheet |
| `app_session_join_call` | Mentorship session ( /mentorship-session ) | Session join call |
| `app_session_join_session` | Mentorship session ( /mentorship-session ) | join session |
| `app_session_onboarding_submit` | Mentorship session ( /mentorship-session ) | submit |
| `app_session_portfolio_open_version` | Mentorship session ( /mentorship-session ) | Session portfolio open version |
| `app_session_portfolio_report` | Mentorship session ( /mentorship-session ) | portfolio review report |
| `app_session_portfolio_review_report` | Mentorship session ( /mentorship-session ) | portfolio review report |
| `app_session_portfolio_submit` | Mentorship session ( /mentorship-session ) | Session portfolio submit |
| `app_session_portfolio_upload_new_version` | Mentorship session ( /mentorship-session ) | update portfolio |
| `app_session_portfolio_walkthrough` | Mentorship session ( /mentorship-session ) | your portfolio walkthrough |
| `app_session_recording_open` | Mentorship session ( /mentorship-session ) | Session recording open |
| `app_session_recording_tab_comments` | Mentorship session ( /mentorship-session ) | Session recording tab comments |
| `app_session_recording_tab_google_sheet` | Mentorship session ( /mentorship-session ) | Session recording tab google sheet |
| `app_session_recording_tab_portfolio` | Mentorship session ( /mentorship-session ) | Session recording tab portfolio |
| `app_session_recording_tab_portfolio_review` | Mentorship session ( /mentorship-session ) | Session recording tab portfolio review |
| `app_session_recording_tab_resume` | Mentorship session ( /mentorship-session ) | Session recording tab resume |
| `app_session_recording_tab_summary_transcript` | Mentorship session ( /mentorship-session ) | Session recording tab summary transcript |
| `app_session_resource_claude_design_features` | Mentorship session ( /mentorship-session ) | Session resource claude design features |
| `app_session_resource_colour_theory_in_movies` | Mentorship session ( /mentorship-session ) | Session resource colour theory in movies |
| `app_session_resource_creative_confidence` | Mentorship session ( /mentorship-session ) | Session resource creative confidence |
| `app_session_resource_new_york_subway_system` | Mentorship session ( /mentorship-session ) | Session resource new york subway system |
| `app_session_resource_skill_tracker_sheet` | Mentorship session ( /mentorship-session ) | Session resource skill tracker sheet |
| `app_session_resume_open_version` | Mentorship session ( /mentorship-session ) | Session resume open version |
| `app_session_resume_submit` | Mentorship session ( /mentorship-session ) | Session resume submit |
| `app_session_resume_upload_new_version` | Mentorship session ( /mentorship-session ) | update resume |
| `app_session_sign_out` | Mentorship session ( /mentorship-session ) | sign out |
| `app_session_tab_session` | Mentorship session ( /mentorship-session ) | session |
| `app_session_team_linkedin` | Mentorship session ( /mentorship-session ) | Session team linkedin |
| `app_session_upcoming_view_session` | Mentorship session ( /mentorship-session ) | Session upcoming view session |
| `app_session_upload_portfolio` | Mentorship session ( /mentorship-session ) | Session upload portfolio |
| `app_session_upload_resume` | Mentorship session ( /mentorship-session ) | Session upload resume |
| `app_session_view_past_sessions` | Mentorship session ( /mentorship-session ) | view past sessions & recordings / view past sessions |
| `app_session_whatsapp_connect` | Mentorship session ( /mentorship-session ) | contact us |
| `app_onboarding_admin_profile_back` | Onboarding ( /onboarding ) | Back |
| `app_onboarding_admin_profile_continue` | Onboarding ( /onboarding ) | Continue → |
| `app_onboarding_chat_pick_<suggested answer>` | Onboarding ( /onboarding ) | Onboarding chat pick <suggested answer> |
| `app_onboarding_chat_send` | Onboarding ( /onboarding ) | Onboarding chat send |
| `app_onboarding_log_out` | Onboarding ( /onboarding ) | Log out |
| `app_onboarding_org_type_back` | Onboarding ( /onboarding ) | Back |
| `app_onboarding_org_type_company` | Onboarding ( /onboarding ) | Onboarding org type company |
| `app_onboarding_org_type_continue` | Onboarding ( /onboarding ) | Continue → |
| `app_onboarding_org_type_institute` | Onboarding ( /onboarding ) | Onboarding org type institute |
| `app_onboarding_professional_back` | Onboarding ( /onboarding ) | ← Back |
| `app_onboarding_professional_continue` | Onboarding ( /onboarding ) | Onboarding professional continue |
| `app_onboarding_role_back` | Onboarding ( /onboarding ) | back |
| `app_onboarding_role_professional` | Onboarding ( /onboarding ) | Onboarding role professional |
| `app_onboarding_role_student` | Onboarding ( /onboarding ) | Onboarding role student |
| `app_onboarding_seed_planted_lets_go` | Onboarding ( /onboarding ) | Let's go |
| `app_onboarding_space_back` | Onboarding ( /onboarding ) | Back |
| `app_onboarding_space_build_my_space` | Onboarding ( /onboarding ) | Build my space → |
| `app_onboarding_space_no_website` | Onboarding ( /onboarding ) | don't have a website? enter your institute name instead → |
| `app_onboarding_space_use_website` | Onboarding ( /onboarding ) | ← actually, use a website link |
| `app_onboarding_student_details_back` | Onboarding ( /onboarding ) | ← Back |
| `app_onboarding_student_details_continue` | Onboarding ( /onboarding ) | Onboarding student details continue |
| `app_onboarding_student_id_back` | Onboarding ( /onboarding ) | ← Back |
| `app_onboarding_student_id_continue` | Onboarding ( /onboarding ) | Onboarding student id continue |
| `app_onboarding_student_id_enter_manually` | Onboarding ( /onboarding ) | Prefer to type it in? Enter details manually |
| `app_onboarding_team_back` | Onboarding ( /onboarding ) | Back |
| `app_onboarding_team_continue` | Onboarding ( /onboarding ) | Continue → |
| `app_onboarding_team_type_company` | Onboarding ( /onboarding ) | Onboarding team type company |
| `app_onboarding_team_type_institute` | Onboarding ( /onboarding ) | Onboarding team type institute |
| `app_onboarding_try_again` | Onboarding ( /onboarding ) | Try again → |
| `app_onboarding_view_profile` | Onboarding ( /onboarding ) | Onboarding view profile |
| `app_coupon_sheet_done` | Plans, trial & payment pop-ups | Coupon sheet done |
| `app_pay_done` | Plans, trial & payment pop-ups | Done |
| `app_pay_not_now` | Plans, trial & payment pop-ups | Not now |
| `app_pay_option_direct` | Plans, trial & payment pop-ups | Pay for this only |
| `app_pay_option_subscribe_annual` | Plans, trial & payment pop-ups | Pay option subscribe annual |
| `app_pay_option_subscribe_monthly` | Plans, trial & payment pop-ups | Pay option subscribe monthly |
| `app_pay_pay_now` | Plans, trial & payment pop-ups | Pay pay now |
| `app_pay_subscribe_and_pay` | Plans, trial & payment pop-ups | Pay subscribe and pay |
| `app_pay_try_again` | Plans, trial & payment pop-ups | Try again |
| `app_plans_coupon_free_annual_access` | Plans, trial & payment pop-ups | Avail free annual access |
| `app_plans_im_a_student` | Plans, trial & payment pop-ups | I’m a student |
| `app_plans_subscribe_annual` | Plans, trial & payment pop-ups | Subscribe · per year |
| `app_plans_subscribe_monthly` | Plans, trial & payment pop-ups | Subscribe · per month |
| `app_plans_upload_student_id` | Plans, trial & payment pop-ups | Upload ID and get student price |
| `app_trial_ended_continue_free` | Plans, trial & payment pop-ups | Continue |
| `app_trial_ended_lets_unlock` | Plans, trial & payment pop-ups | Let’s unlock |
| `app_trial_status_see_plans` | Plans, trial & payment pop-ups | Trial status see plans |
| `app_verified_not_now` | Plans, trial & payment pop-ups | Not now |
| `app_verified_publish_share` | Plans, trial & payment pop-ups | Publish & share |
| `app_verify_prompt_maybe_later` | Plans, trial & payment pop-ups | Maybe later |
| `app_verify_prompt_start_verification` | Plans, trial & payment pop-ups | Verify prompt start verification |
| `app_vip_welcome_explore_access` | Plans, trial & payment pop-ups | Vip welcome explore access |
| `app_welcome_back_continue` | Plans, trial & payment pop-ups | Welcome back continue |
| `app_welcome_back_see_plans` | Plans, trial & payment pop-ups | Welcome back see plans |
| `app_tab_community` | Platform bottom tab bar (mobile) | Tab community |
| `app_tab_events` | Platform bottom tab bar (mobile) | Tab events |
| `app_tab_grow` | Platform bottom tab bar (mobile) | Tab grow |
| `app_tab_profile` | Platform bottom tab bar (mobile) | Tab profile |
| `app_account_delete_confirm` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | Delete my account |
| `app_account_logout_confirm` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | Log out |
| `app_account_menu_account` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) ; Profile & account ( /app/profile, /app/account ) | My Account |
| `app_account_menu_delete` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) ; Profile & account ( /app/profile, /app/account ) | Delete Account |
| `app_account_menu_invoice` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) ; Profile & account ( /app/profile, /app/account ) | Invoice |
| `app_account_menu_logout` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) ; Profile & account ( /app/profile, /app/account ) | Log Out |
| `app_events_back_to_profile` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | [back to my profile] |
| `app_events_filter_past` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | Events filter past |
| `app_events_filter_upcoming` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | Events filter upcoming |
| `app_events_list_open_event` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | Events list open event |
| `app_events_list_open_typetober` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | Events list open typetober |
| `app_events_rail_featured_open` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | Events rail featured open |
| `app_events_rail_featured_view_event` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | View Event |
| `app_events_rail_open_event` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | Events rail open event |
| `app_events_rail_view_all` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | View all |
| `app_profile_complete_profile` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | complete your profile → |
| `app_profile_header_avatar` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | Profile header avatar |
| `app_profile_header_discord` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | Evolve community |
| `app_profile_header_logo` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | Profile header logo |
| `app_profile_tab_grow` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | Profile tab grow |
| `app_profile_tab_profile` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | Profile tab profile |
| `app_trial_bar_see_plans` | Platform shell: profile, events, header ( /app/* ; public /profile/:username ) | Trial bar see plans |
| `app_portfolio_review_flow_apply_again` | Portfolio review workspace ( /app/grow/portfolio-review ) | Apply again → |
| `app_portfolio_review_flow_back_to_programmes` | Portfolio review workspace ( /app/grow/portfolio-review ) | Back to programmes |
| `app_portfolio_review_flow_book_follow_up` | Portfolio review workspace ( /app/grow/portfolio-review ) | Book a follow-up call → |
| `app_portfolio_review_flow_open_report` | Portfolio review workspace ( /app/grow/portfolio-review ) | Open report in new tab ↗ |
| `app_portfolio_review_flow_portfolio_link` | Portfolio review workspace ( /app/grow/portfolio-review ) | Link |
| `app_portfolio_review_flow_portfolio_upload` | Portfolio review workspace ( /app/grow/portfolio-review ) | Upload |
| `app_portfolio_review_flow_questions_continue` | Portfolio review workspace ( /app/grow/portfolio-review ) | Portfolio review flow questions continue |
| `app_portfolio_review_flow_questions_skip` | Portfolio review workspace ( /app/grow/portfolio-review ) | Skip |
| `app_portfolio_review_flow_reschedule_call` | Portfolio review workspace ( /app/grow/portfolio-review ) | Need to reschedule? |
| `app_portfolio_review_flow_resume_link` | Portfolio review workspace ( /app/grow/portfolio-review ) | Link |
| `app_portfolio_review_flow_resume_upload` | Portfolio review workspace ( /app/grow/portfolio-review ) | Upload |
| `app_portfolio_review_flow_save_for_later` | Portfolio review workspace ( /app/grow/portfolio-review ) | Portfolio review flow save for later |
| `app_portfolio_review_flow_step_book_a_follow_up_call` | Portfolio review workspace ( /app/grow/portfolio-review ) | Portfolio review flow step book a follow up call |
| `app_portfolio_review_flow_step_call_confirmed` | Portfolio review workspace ( /app/grow/portfolio-review ) | Portfolio review flow step call confirmed |
| `app_portfolio_review_flow_step_pick_a_slot` | Portfolio review workspace ( /app/grow/portfolio-review ) | Portfolio review flow step pick a slot |
| `app_portfolio_review_flow_step_upload_resume_and_portfolio` | Portfolio review workspace ( /app/grow/portfolio-review ) | Portfolio review flow step upload resume and portfolio |
| `app_portfolio_review_flow_step_view_report` | Portfolio review workspace ( /app/grow/portfolio-review ) | Portfolio review flow step view report |
| `app_portfolio_review_flow_step_view_session` | Portfolio review workspace ( /app/grow/portfolio-review ) | Portfolio review flow step view session |
| `app_portfolio_review_flow_submit_book_call` | Portfolio review workspace ( /app/grow/portfolio-review ) | Portfolio review flow submit book call |
| `app_portfolio_review_flow_submit_feedback` | Portfolio review workspace ( /app/grow/portfolio-review ) | Submit feedback |
| `app_portfolio_review_flow_view_past_cycle` | Portfolio review workspace ( /app/grow/portfolio-review ) | View this review → |
| `app_account_save_changes` | Profile & account ( /app/profile, /app/account ) | Account save changes |
| `app_profile_build_my_profile` | Profile & account ( /app/profile, /app/account ) | Build my profile |
| `app_profile_copy_share_link` | Profile & account ( /app/profile, /app/account ) | Profile copy share link |
| `app_profile_get_started_upload` | Profile & account ( /app/profile, /app/account ) | Get started |
| `app_profile_link_portfolio` | Profile & account ( /app/profile, /app/account ) | Profile link portfolio |
| `app_profile_link_resume` | Profile & account ( /app/profile, /app/account ) | Profile link resume |
| `app_profile_portfolio` | Profile & account ( /app/profile, /app/account ) | [Portfolio] |
| `app_profile_publish` | Profile & account ( /app/profile, /app/account ) | Publish |
| `app_profile_resume` | Profile & account ( /app/profile, /app/account ) | [Resume] |
| `app_profile_social_link` | Profile & account ( /app/profile, /app/account ) | Profile social link |
| `app_profile_source_mode_file` | Profile & account ( /app/profile, /app/account ) | upload a file |
| `app_profile_source_mode_link` | Profile & account ( /app/profile, /app/account ) | paste a link |
| `app_profile_unlock_with_plan` | Profile & account ( /app/profile, /app/account ) | Unlock with a plan |
| `app_profile_unpublish` | Profile & account ( /app/profile, /app/account ) | Unpublish |
| `app_profile_update_profile` | Profile & account ( /app/profile, /app/account ) | [Update profile] |
| `app_profile_verify` | Profile & account ( /app/profile, /app/account ) | Verify |
| `app_verify_call_link` | Profile verification | Your call link → |
| `app_verify_copy_link` | Profile verification | Verify copy link |
| `app_verify_flow_confirm_booking` | Profile verification | Verify flow confirm booking |
| `app_verify_flow_continue` | Profile verification | Continue |
| `app_verify_flow_pick_slot` | Profile verification | Verify flow pick slot |
| `app_verify_join_call` | Profile verification | Join call → |
| `app_verify_publish_profile` | Profile verification | Publish profile |
| `app_verify_reschedule` | Profile verification | Reschedule |
| `app_verify_reupload_reapply` | Profile verification | Re-upload & reapply |
| `app_verify_start_verification` | Profile verification | Start verification |
| `app_verify_unpublish` | Profile verification | Unpublish |
| `app_programme_mentorship_back_to_grow` | Programme page ( /programmes/mentorship ) | Programme mentorship back to grow |
| `app_programme_portfolio_review_back_to_grow` | Programme page ( /programmes/portfolio-review ) | Programme portfolio review back to grow |
| `app_typetober_add_letter` | Typetober ( /typetober and /app/typetober ) | Typetober add letter |
| `app_typetober_bulk_add_more` | Typetober ( /typetober and /app/typetober ) | Add more |
| `app_typetober_bulk_choose_images` | Typetober ( /typetober and /app/typetober ) | Choose images |
| `app_typetober_bulk_continue` | Typetober ( /typetober and /app/typetober ) | Typetober bulk continue |
| `app_typetober_bulk_currency_inr` | Typetober ( /typetober and /app/typetober ) | Typetober bulk currency inr |
| `app_typetober_bulk_currency_usd` | Typetober ( /typetober and /app/typetober ) | Typetober bulk currency usd |
| `app_typetober_bulk_pay_submit` | Typetober ( /typetober and /app/typetober ) | Typetober bulk pay submit |
| `app_typetober_bulk_see_on_wall` | Typetober ( /typetober and /app/typetober ) | See them on the wall |
| `app_typetober_bulk_upload_fab` | Typetober ( /typetober and /app/typetober ) | Bulk upload |
| `app_typetober_example_view` | Typetober ( /typetober and /app/typetober ) | Typetober example view |
| `app_typetober_hero_accept_challenge` | Typetober ( /typetober and /app/typetober ) | Typetober hero accept challenge |
| `app_typetober_hero_see_gallery` | Typetober ( /typetober and /app/typetober ) | Typetober hero see gallery |
| `app_typetober_hero_vote_now` | Typetober ( /typetober and /app/typetober ) | Typetober hero vote now |
| `app_typetober_info_tab_faqs` | Typetober ( /typetober and /app/typetober ) | Typetober info tab faqs |
| `app_typetober_info_tab_guidelines` | Typetober ( /typetober and /app/typetober ) | Typetober info tab guidelines |
| `app_typetober_letter_share` | Typetober ( /typetober and /app/typetober ) | Share this letter |
| `app_typetober_letter_tab` | Typetober ( /typetober and /app/typetober ) | Typetober letter tab |
| `app_typetober_letter_take_challenge` | Typetober ( /typetober and /app/typetober ) | Take the challenge |
| `app_typetober_my_letter_view` | Typetober ( /typetober and /app/typetober ) | Typetober my letter view |
| `app_typetober_nav_back_to_platform` | Typetober ( /typetober and /app/typetober ) | [back to my platform] |
| `app_typetober_nav_guidelines` | Typetober ( /typetober and /app/typetober ) | [Guidelines] |
| `app_typetober_nav_join_community` | Typetober ( /typetober and /app/typetober ) | [Join community] |
| `app_typetober_nav_menu_about` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu about |
| `app_typetober_nav_menu_community` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu community |
| `app_typetober_nav_menu_contact_us` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu contact us |
| `app_typetober_nav_menu_events` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu events |
| `app_typetober_nav_menu_grow` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu grow |
| `app_typetober_nav_menu_home` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu home |
| `app_typetober_nav_menu_mentorship_programme` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu mentorship programme |
| `app_typetober_nav_menu_portfolio_review` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu portfolio review |
| `app_typetober_nav_menu_pricing` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu pricing |
| `app_typetober_nav_menu_profile_creation` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu profile creation |
| `app_typetober_nav_menu_toggle` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu toggle |
| `app_typetober_nav_menu_typetober` | Typetober ( /typetober and /app/typetober ) | Typetober nav menu typetober |
| `app_typetober_nav_prizes` | Typetober ( /typetober and /app/typetober ) | [Prizes] |
| `app_typetober_nav_profile` | Typetober ( /typetober and /app/typetober ) | Typetober nav profile |
| `app_typetober_profile_bulk_upload` | Typetober ( /typetober and /app/typetober ) | Bulk upload |
| `app_typetober_profile_download_certificate` | Typetober ( /typetober and /app/typetober ) | Download certificate |
| `app_typetober_profile_go_to_letter` | Typetober ( /typetober and /app/typetober ) | Typetober profile go to letter |
| `app_typetober_profile_sign_out` | Typetober ( /typetober and /app/typetober ) | Sign out |
| `app_typetober_profile_tab_certs` | Typetober ( /typetober and /app/typetober ) | Typetober profile tab certs |
| `app_typetober_profile_tab_subs` | Typetober ( /typetober and /app/typetober ) | Typetober profile tab subs |
| `app_typetober_profile_view_letter` | Typetober ( /typetober and /app/typetober ) | Typetober profile view letter |
| `app_typetober_share_copy_caption` | Typetober ( /typetober and /app/typetober ) | Typetober share copy caption |
| `app_typetober_share_copy_link` | Typetober ( /typetober and /app/typetober ) | Typetober share copy link |
| `app_typetober_share_discord_join` | Typetober ( /typetober and /app/typetober ) | Join |
| `app_typetober_share_instagram` | Typetober ( /typetober and /app/typetober ) | Typetober share instagram |
| `app_typetober_share_native` | Typetober ( /typetober and /app/typetober ) | Share |
| `app_typetober_share_save_image` | Typetober ( /typetober and /app/typetober ) | Save image |
| `app_typetober_share_whatsapp` | Typetober ( /typetober and /app/typetober ) | Typetober share whatsapp |
| `app_typetober_share_x` | Typetober ( /typetober and /app/typetober ) | Typetober share x |
| `app_typetober_signin_email` | Typetober ( /typetober and /app/typetober ) | Typetober signin email |
| `app_typetober_signin_google` | Typetober ( /typetober and /app/typetober ) | Typetober signin google |
| `app_typetober_signin_linkedin` | Typetober ( /typetober and /app/typetober ) | Typetober signin linkedin |
| `app_typetober_signin_resend_code` | Typetober ( /typetober and /app/typetober ) | Resend code |
| `app_typetober_signin_send_code` | Typetober ( /typetober and /app/typetober ) | Send me a code |
| `app_typetober_signin_verify_code` | Typetober ( /typetober and /app/typetober ) | Verify & continue |
| `app_typetober_upload_choose_image` | Typetober ( /typetober and /app/typetober ) | Typetober upload choose image |
| `app_typetober_upload_continue` | Typetober ( /typetober and /app/typetober ) | Continue → |
| `app_typetober_upload_currency_inr` | Typetober ( /typetober and /app/typetober ) | Typetober upload currency inr |
| `app_typetober_upload_currency_usd` | Typetober ( /typetober and /app/typetober ) | Typetober upload currency usd |
| `app_typetober_upload_pay_submit` | Typetober ( /typetober and /app/typetober ) | Typetober upload pay submit |
| `app_typetober_upload_see_on_wall` | Typetober ( /typetober and /app/typetober ) | See it on the wall |
| `app_typetober_upload_switch_to_bulk` | Typetober ( /typetober and /app/typetober ) | Upload many at once |
| `app_typetober_upload_take_photo` | Typetober ( /typetober and /app/typetober ) | Take photo |
| `app_typetober_vote` | Typetober ( /typetober and /app/typetober ) | Typetober vote |
| `app_typetober_wall_entry_view` | Typetober ( /typetober and /app/typetober ) | Typetober wall entry view |
