// Function to show the info box
function showInfo(event) {
    var infoContent = this.getAttribute('data-info');
    var infoBox = document.getElementById('info-box');
    var infoContentElement = document.getElementById('info-content');
    infoContentElement.textContent = infoContent;
  
    // Make the info box temporarily visible to get its dimensions
    infoBox.style.display = 'block';
    infoBox.style.visibility = 'hidden'; // Hide it visually but keep its dimensions
  
    // Get the position of the button relative to the container
    var buttonRect = this.getBoundingClientRect();
    var containerRect = document.querySelector('.image-container').getBoundingClientRect();

    // Calculate the maximum allowed width
    var maxInfoBoxWidth = containerRect.width * 0.9; // 90% of container width
    infoBox.style.maxWidth = maxInfoBoxWidth + 'px';

    // Get the actual width and height of the info box after setting max-width
    var infoBoxWidth = infoBox.offsetWidth;
    var infoBoxHeight = infoBox.offsetHeight;
  
    // Calculate the position for the info box
    var top = buttonRect.top - containerRect.top - infoBoxHeight - 10; // 10px above the button
    var left = buttonRect.left - containerRect.left;

    console.log(buttonRect.top - containerRect.top);
  
    // Ensure the info box doesn't go outside the container on the top
    if (top < 0) {
      top = buttonRect.bottom - containerRect.top + 10; // Place it below the button if there's no space above
    }
  
    // Adjust the left position if the info box goes beyond the container
    if (left + infoBox.offsetWidth > containerRect.width) {
      left = containerRect.width - infoBox.offsetWidth - 10; // 10px padding from the right edge
    }
  
    // Set the position of the info box
    infoBox.style.top = top + containerRect.top + 'px';
    infoBox.style.left = left + containerRect.left + 'px';
  
    // Make the info box visible
    infoBox.style.visibility = 'visible';
  }
  
  // Get all plus buttons
  var plusButtons = document.querySelectorAll('.plus-button');
  
  // Add click event listeners to each plus button
  plusButtons.forEach(function(button) {
    button.addEventListener('click', showInfo);
  });
  
  // Function to close the information box
  function closeInfo() {
    var infoBox = document.getElementById('info-box');
    infoBox.style.display = 'none';
  }
  