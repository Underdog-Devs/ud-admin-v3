export type Post = {
      id: string;
      title: string;
	first_paragraph: string;
	text: string;
	author: string;
	created_at: string;
	name: string;
	entry: any;
      image: string;
      authors: Authors;
};

export type Authors = {
      id: string;
      name: string;
      email: string;
      image: string;
}