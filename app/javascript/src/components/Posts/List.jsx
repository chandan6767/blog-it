import React from "react";

import Card from "./Card";

const List = ({ posts }) => (
  <div className="flex-1 divide-bb-border">
    {posts.map(post => (
      <Card key={post.id} {...post} />
    ))}
  </div>
);

export default List;
