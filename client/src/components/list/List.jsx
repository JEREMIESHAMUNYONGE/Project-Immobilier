import './list.scss'
import Card from "../card/Card"

function List({ posts, onPostClick }) {
  return (
    <div className='list'>
      {posts.map(item => (
        <Card key={item.id} item={item} onClick={onPostClick} />
      ))}
    </div>
  )
}

export default List