document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('courseId');

  fetch(`/doPost?action=getCourseDetails&courseId=${courseId}`)
      .then(response => response.json())
      .then(courseDetails => {
          document.getElementById('course-name').textContent = courseDetails.name;
          document.getElementById('course-content').textContent = courseDetails.content;
      })
      .catch(error => console.error('Lỗi khi lấy chi tiết khóa học:', error));
});
