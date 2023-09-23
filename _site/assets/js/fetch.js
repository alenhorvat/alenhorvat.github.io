// github-profile-fetcher.js
// Function to perform the search action
function performSearch() {
  // Get the value from the input field
  const githubHandler = document.getElementById('github-handler').value;

  // Construct the URL with the query parameter
  const profileURL = `/profile?id=${githubHandler}`;

  // Navigate to the profile subpage
  window.location.href = profileURL;
}

document.addEventListener('DOMContentLoaded', async function () {

  const urlParams = new URLSearchParams(window.location.search);

  // Get the value of the 'id' query parameter
  const githubHandler = urlParams.get('id');
  let userProfile = {
  }

  try {
    const profileResponse = await fetch(`https://raw.githubusercontent.com/${githubHandler}/verifiable-profile/main/my-profile.yaml`);

    if (!profileResponse.ok) {
      throw new Error(`Failed to fetch profile data. Status: ${profileResponse.status}`);
    }

    const profileText = await profileResponse.text();
    // Parse the YAML content into a JavaScript object
    const profileData = jsyaml.load(profileText);

    // Validate the profile data against the JSON schema
    const profileSchema = {
      // JSON schema for the profile data (as provided in the question)
    };

    // const profileValidator = new Ajv();
    // const isProfileValid = profileValidator.validate(profileSchema, profileData);
    const isProfileValid = true

    if (!isProfileValid) {
      console.error('Profile data is not valid according to the schema');
      return;
    }

    // Create an object to store the profile data
    // const userProfile = {
    //   profileData,
    //   projects: [],
    // };

    userProfile = {
      Name: profileData.givenName + ' ' + profileData.familyName,
      Bio: profileData.bio,
      Location: profileData.address,
      Projects: [],
    }

    // Loop over the projects and fetch contributions.yaml for each project
    for (const projectURL of profileData.projects) {
      // Replace the "github.com" with "raw.githubusercontent.com" in the projectURL
      const rawProjectURL = projectURL.replace('github.com', 'raw.githubusercontent.com');
      // Construct the URL to the contributions.yaml file in the main branch
      const contributionsURL = `${rawProjectURL}/main/contributions.yaml`;

      const contributionsResponse = await fetch(contributionsURL);
      const contributionsText = await contributionsResponse.text();

      // Parse the YAML content into a JavaScript object
      const contributionsData = jsyaml.load(contributionsText);

      // Validate the contributions data against the JSON schema
      const contributionsSchema = {
        // JSON schema for the contributions data (as provided in the question)
      };

      // const contributionsValidator = new Ajv();
      // const isContributionsValid = contributionsValidator.validate(contributionsSchema, contributionsData);
      const isContributionsValid = true

      if (!isContributionsValid) {
        console.error('Contributions data is not valid according to the schema');
        continue;
      }

      // Find the contributor that matches the entered GitHub handler
      const matchingContributor = contributionsData.contributors.find(contributor => contributor.githubHandler === githubHandler);

      if (matchingContributor) {
        userProfile.Projects.push({
          project: projectURL,
          contributions: matchingContributor,
        });
      }
    }
    // Continue with processing the profileText
  } catch (error) {
    // Handle the error here
    console.error('Error fetching profile data:', error);
    userProfile = {
      "Error": `Profile '${githubHandler}' must set up it's Verifiable Portfolio`
    }
  }

  // Render the profile data as HTML (replace with your desired HTML structure)
  const profileContainer = document.getElementById('profile-container');
  profileContainer.innerHTML = `
      <pre>${JSON.stringify(userProfile, null, 2)}</pre>
    `;
  console.log(userProfile)

  // Add an event listener to the input field (Enter key press event)
  document.getElementById('github-handler').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      // Prevent the default form submission behavior
      event.preventDefault();
      performSearch();
    }
  });
});
