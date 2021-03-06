import { GetStaticProps } from 'next';
import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBr from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  // TODO
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [nextPageData, setNextPageData] = useState<Post[]>();

  function handleNextPage(): void {
    fetch(nextPage)
      .then(response => response.json())
      .then(data => {
        setNextPage(data.next_page);

        if (nextPageData) {
          setNextPageData([...nextPageData, ...data.results]);
        } else {
          setNextPageData(data.results);
        }
      });
  }

  return (
    <main className={commonStyles.container}>
      <div className={styles.homeLogo}>
        <img src="/images/logo.svg" alt="logo" />
      </div>

      <div className={styles.posts}>
        {postsPagination.results.map(post => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a>
              <strong className={styles.title}>{post.data.title}</strong>
              <p className={styles.subtitle}>{post.data.subtitle}</p>
              <div className={commonStyles.info}>
                <FiCalendar size="1.25rem" />
                <time>
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM uuuu',
                    {
                      locale: ptBr,
                    }
                  )}
                </time>
                <FiUser size="1.25rem" />
                <span>{post.data.author}</span>
              </div>
            </a>
          </Link>
        ))}

        {nextPageData
          ? nextPageData.map(post => (
              <Link href={`/post/${post.uid}`} key={post.uid}>
                <a>
                  <strong className={styles.title}>{post.data.title}</strong>
                  <p className={styles.subtitle}>{post.data.subtitle}</p>
                  <div className={commonStyles.info}>
                    <FiCalendar size="1.25rem" />
                    <time>
                      {format(
                        new Date(post.first_publication_date),
                        'MM LLL yyyy',
                        {
                          locale: ptBr,
                        }
                      )}
                    </time>
                    <FiUser size="1.25rem" />
                    <span>{post.data.author}</span>
                  </div>
                </a>
              </Link>
            ))
          : ''}
      </div>

      {nextPage ? (
        <button
          className={styles.buttonLoadMore}
          type="button"
          onClick={handleNextPage}
        >
          Carregar mais posts
        </button>
      ) : (
        ''
      )}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    // TODO
    Prismic.Predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
    }
  );

  const formattedResults = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: post.first_publication_date,
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: [...formattedResults],
  };

  return {
    props: {
      postsPagination,
    },
  };
};
