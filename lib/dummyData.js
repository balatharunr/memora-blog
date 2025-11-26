// Dummy data for the Memora app
export const hashtags = ['tech','fashion','food','culture','politics','travel','ai','photography','music','art','fitness','health','books','gaming','sports'];

export const posts = [
  {
    id: 1,
    title: 'Sunset at Rock Beach Pondicherry',
    content: "There's something magical about watching the sun dip below the horizon at Rock Beach. The colors, the atmosphere, the feeling of being present in that moment—it's all pure bliss.",
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop',
    author: { 
      id: 'user1',
      name: 'laxmisai_93', 
      avatar: 'https://i.pravatar.cc/150?img=12',
      location: 'Rock Beach Pondicherry'
    },
    likes: 1234,
    comments: [
      { id: 101, author: { name: 'traveler22' }, content: 'Amazing shot! The colors are incredible!' },
      { id: 102, author: { name: 'photoexpert' }, content: 'The composition is perfect. What camera did you use?' }
    ],
    timestamp: '2025-09-06T15:30:00',
    readableDate: '14h',
    hashtags: ['travel', 'photography', 'sunset', 'beach']
  },
  {
    id: 2,
    title: 'Morning Coffee Thoughts',
    content: "There's nothing like starting the day with a perfectly brewed cup of coffee and some time to gather your thoughts. What's your morning ritual?",
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop',
    author: { 
      id: 'user2',
      name: 'coffee_lover', 
      avatar: 'https://i.pravatar.cc/150?img=5',
      location: 'Cafe Chronicles'
    },
    likes: 865,
    comments: [
      { id: 103, author: { name: 'earlybird' }, content: 'I can almost smell it through the screen!' },
      { id: 104, author: { name: 'nightowl' }, content: 'Coffee is my lifeline every morning.' }
    ],
    timestamp: '2025-09-06T08:15:00',
    readableDate: '22h',
    hashtags: ['coffee', 'morning', 'lifestyle']
  },
  {
    id: 3,
    title: 'Tech Conference Highlights',
    content: 'Spent the day at TechConnect 2025. Mind blown by the innovations in AI and sustainable technology. The future is now!',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
    author: { 
      id: 'user3',
      name: 'tech_enthusiast', 
      avatar: 'https://i.pravatar.cc/150?img=22',
      location: 'Tech Convention Center'
    },
    likes: 1542,
    comments: [
      { id: 105, author: { name: 'dev_guru' }, content: 'What was your favorite presentation?' },
      { id: 106, author: { name: 'futurist' }, content: 'AI advancements are happening faster than predicted!' }
    ],
    timestamp: '2025-09-05T14:45:00',
    readableDate: '1d',
    hashtags: ['tech', 'ai', 'innovation', 'conference']
  }
];

export const trending = [
  { id: 't1', title: 'Rock Beach Sunset', excerpt: 'Views from Pondicherry', preview: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=400&auto=format&fit=crop' },
  { id: 't2', title: 'Coffee Culture', excerpt: 'Morning rituals', preview: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400&auto=format&fit=crop' },
  { id: 't3', title: 'Tech Conference 2025', excerpt: 'Future innovations', preview: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=400&auto=format&fit=crop' },
  { id: 't4', title: 'Mindfulness Meditation', excerpt: 'Daily practice', preview: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=400&auto=format&fit=crop' },
  { id: 't5', title: 'Urban Photography', excerpt: 'City landscapes', preview: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=400&auto=format&fit=crop' }
];

export const users = [
  {
    id: 'user1',
    name: 'laxmisai_93',
    email: 'laxmisai@example.com',
    avatar: 'https://i.pravatar.cc/150?img=12',
    bio: 'Photographer | Traveler | Coffee enthusiast',
    location: 'Pondicherry, India'
  },
  {
    id: 'user2',
    name: 'coffee_lover',
    email: 'coffee@example.com',
    avatar: 'https://i.pravatar.cc/150?img=5',
    bio: 'Life begins after coffee ☕',
    location: 'Bangalore, India'
  },
  {
    id: 'user3',
    name: 'tech_enthusiast',
    email: 'tech@example.com',
    avatar: 'https://i.pravatar.cc/150?img=22',
    bio: 'Always exploring the latest in technology',
    location: 'Mumbai, India'
  }
];

export const notifications = [
  {
    id: 'n1',
    type: 'like',
    user: { name: 'coffee_lover', avatar: 'https://i.pravatar.cc/150?img=5' },
    content: 'liked your post',
    postId: 1,
    timestamp: '2025-09-06T20:15:00',
    read: false
  },
  {
    id: 'n2',
    type: 'comment',
    user: { name: 'tech_enthusiast', avatar: 'https://i.pravatar.cc/150?img=22' },
    content: 'commented: "Great shot!"',
    postId: 1,
    timestamp: '2025-09-06T19:45:00',
    read: false
  },
  {
    id: 'n3',
    type: 'follow',
    user: { name: 'photography_fan', avatar: 'https://i.pravatar.cc/150?img=33' },
    content: 'started following you',
    timestamp: '2025-09-06T15:30:00',
    read: true
  }
];

export const messages = [
  {
    id: 'chat1',
    with: { id: 'user2', name: 'coffee_lover', avatar: 'https://i.pravatar.cc/150?img=5' },
    lastMessage: {
      text: 'Hey, loved your latest post!',
      timestamp: '2025-09-06T21:45:00',
      fromMe: false
    },
    unread: 2
  },
  {
    id: 'chat2',
    with: { id: 'user3', name: 'tech_enthusiast', avatar: 'https://i.pravatar.cc/150?img=22' },
    lastMessage: {
      text: 'Thanks for the recommendations!',
      timestamp: '2025-09-05T18:30:00',
      fromMe: true
    },
    unread: 0
  },
  {
    id: 'chat3',
    with: { id: 'user4', name: 'photography_fan', avatar: 'https://i.pravatar.cc/150?img=33' },
    lastMessage: {
      text: 'What camera settings did you use?',
      timestamp: '2025-09-04T14:15:00',
      fromMe: false
    },
    unread: 1
  }
];
