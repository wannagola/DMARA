import { useNavigate } from 'react-router-dom';
import styles from './FollowerModal.module.css';

type User = {
  id: number;
  username: string;
  profile_image: string | null;
};

type Props = {
  title: 'Followers' | 'Following';
  users: User[];
  onClose: () => void;
};

const defaultAvatar = '/vite.svg';

export default function FollowerModal({ title, users, onClose }: Props) {
  const navigate = useNavigate();

  const handleUserClick = (userId: number) => {
    // Need to figure out the correct path to a user's WhoAmI page
    // For now, assuming it's /whoami/:id
    navigate(`/whoami/${userId}`);
    onClose();
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <h2 className={styles.headline}>{title}</h2>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <ul className={styles.userList}>
          {users.map((user) => (
            <li key={user.id} className={styles.userItem} onClick={() => handleUserClick(user.id)}>
              <img 
                src={user.profile_image || defaultAvatar} 
                alt={user.username} 
                className={styles.avatar}
              />
              <span className={styles.username}>{user.username}</span>
            </li>
          ))}
          {users.length === 0 && <p className={styles.emptyMessage}>No users to display.</p>}
        </ul>
      </div>
    </>
  );
}
