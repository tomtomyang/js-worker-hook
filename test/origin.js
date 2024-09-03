addEventListener('fetch', (event) => {
  const response = new Response('Hello World!');
  event.respondWith(response);
});
