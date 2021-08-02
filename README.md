[![New Relic Experimental header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/Experimental.png)](https://opensource.newrelic.com/oss-category/#new-relic-experimental)
---
# Moved to: https://github.com/newrelic/nr1-status-widgets
---

# NRQL Status Widget

NRQL Powered Status Widget

![NRQL Status Widget](images/nrql-status-widget-1.png)

## Features

- Custom labelling for critical, warning, healthy
- Metric suffixes and labels
- Timeline
- Togglability for all features
- Regex matching for string values
- Configurable OnClick actions to url or Modal
- Modal can be provided any number of additional NRQL queries to be displayed

## Getting Started Locally

```
npm install
npm start
```

## Dashboard Deployment

```
npm install

Generate a new uuid for the nerdpack
nr1 nerdpack:uuid -gf

Publish & Deploy
nr1 nerdpack:publish
nr1 nerdpack:deploy


If you need to target a specific profile add the --profile flag eg.
nr1 nerdpack:uuid -gf --profile=demotron-v2

---

Browse to apps, find this nerdpack visualization and click Manage Access.
Select the relevant accounts to subscribe this visualization too.
Once subscribed go back to apps and click Custom Visualization.
You should then be able to see the widget option there to configure and add to a dashboard.

https://developer.newrelic.com/build-apps/build-visualization#deploy-and-use-your-visualization

```

## Documentation

https://developer.newrelic.com/build-apps/build-visualization

## Support

New Relic hosts and moderates an online forum where customers can interact with New Relic employees as well as other customers to get help and share best practices. Like all official New Relic open source projects, there's a related Community topic in the New Relic Explorers Hub. You can find this project's topic/threads here:

> Add the url for the support thread here

## Contributing

We encourage your contributions to improve NRQL Status Widget! Keep in mind when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. You only have to sign the CLA one time per project.
If you have any questions, or to execute our corporate CLA, required if your contribution is on behalf of a company, please drop us an email at opensource@newrelic.com.

**A note about vulnerabilities**

As noted in our [security policy](../../security/policy), New Relic is committed to the privacy and security of our customers and their data. We believe that providing coordinated disclosure by security researchers and engaging with the security community are important means to achieve our security goals.

If you believe you have found a security vulnerability in this project or any of New Relic's products or websites, we welcome and greatly appreciate you reporting it to New Relic through [HackerOne](https://hackerone.com/newrelic).

## License

NRQL Status Widget is licensed under the [Apache 2.0](http://apache.org/licenses/LICENSE-2.0.txt) License.
