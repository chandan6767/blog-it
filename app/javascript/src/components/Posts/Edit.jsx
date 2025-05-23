import React, { useEffect, useState } from "react";

import { Delete, ExternalLink, MenuHorizontal } from "@bigbinary/neeto-icons";
import { Alert, Button, Dropdown, Typography } from "@bigbinary/neetoui";
import { Container, Header, PageLoader } from "components/commons";
import { useFetchCategories } from "hooks/reactQuery/useCategoriesApi";
import {
  useDeletePost,
  useShowPost,
  useUpdatePost,
} from "hooks/reactQuery/usePostsApi";
import useLocalStorage from "hooks/useLocalStorage";
import Logger from "js-logger";
import { useParams } from "react-router-dom";

import ActionWithDropdown from "./ActionWithDropdown";
import { POST_EDIT_PREVIEW_DATA_KEY, POST_STATUS } from "./constants";
import Form from "./Form";
import { formatDate } from "./utils";

import routes from "~/routes";

const Edit = ({ history }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [status, setStatus] = useState(POST_STATUS.DRAFT);
  const [showAlert, setShowAlert] = useState(false);

  const { slug } = useParams();

  const previewKey = `${POST_EDIT_PREVIEW_DATA_KEY}::${slug}`;

  const [previewData, setPreviewData, clearPreviewData] = useLocalStorage(
    previewKey,
    null,
    10 * 60 * 1000
  );

  const { data: postData, isLoading: isPostLoading } = useShowPost(slug);
  const { data: categoryData } = useFetchCategories();
  const categories = categoryData?.data?.categories || [];

  const { mutate, isLoading: isUpdating } = useUpdatePost({
    onSuccess: () => {
      clearPreviewData();
      history.replace(routes.posts.show.replace(":slug", slug));
    },
    onError: error => {
      Logger.error(error);
    },
  });

  const { mutate: deletePost } = useDeletePost({
    onSuccess: () => {
      clearPreviewData();
      history.replace(routes.root);
    },
    onError: error => {
      Logger.error(error);
    },
  });

  useEffect(() => {
    const post = previewData || postData?.data?.post;

    if (post) {
      setTitle(post.title);
      setDescription(post.description);
      setSelectedCategories(post.categories);
      setStatus(post.status);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPostLoading]);

  useEffect(() => {
    const isDirty = title || description || selectedCategories.length > 0;

    if (isDirty) {
      setPreviewData({
        title,
        description,
        categories: selectedCategories,
        status,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, selectedCategories, status]);

  if (isPostLoading) {
    return (
      <Container>
        <PageLoader className="flex-1" />
      </Container>
    );
  }

  const handleCancel = () => history.goBack();

  const handleSubmit = () => {
    mutate({
      payload: {
        title,
        description,
        category_ids: selectedCategories.map(category => category.id),
        status,
      },
      slug,
    });
  };

  const confirmDelete = () => {
    deletePost(slug);
    setShowAlert(false);
  };

  const handlePreview = () => {
    history.push(`${routes.posts.preview}?source=edit&slug=${slug}`);
  };

  const lastPublished = formatDate(
    postData?.data?.post?.updated_at,
    "HH:mmA, D MMMM YYYY"
  );

  const isPublished = postData?.data?.post?.status === POST_STATUS.PUBLISHED;
  const isDisableSubmitAction =
    isPostLoading || isUpdating || !title.trim() || !description.trim();

  return (
    <Container>
      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 overflow-y-auto px-[5vw] pt-[3vw]">
        <Header
          pageTitle="Edit post"
          actionBlock={
            <>
              <Typography style="body3">
                {isPublished ? "Last published at " : "Draft saved at "}
                <span className="font-medium">{lastPublished}</span>
              </Typography>
              <Button
                icon={ExternalLink}
                style="text"
                tooltipProps={{
                  content: "Preview",
                  position: "top",
                }}
                onClick={handlePreview}
              />
              <Button label="Cancel" style="secondary" onClick={handleCancel} />
              <ActionWithDropdown
                isDisabled={isDisableSubmitAction}
                setStatus={setStatus}
                status={status}
                onSubmit={handleSubmit}
              />
              <Dropdown
                buttonStyle="text"
                buttonProps={{
                  icon: MenuHorizontal,
                }}
                tooltipProps={{
                  content: "More actions",
                  position: "top",
                }}
              >
                <Dropdown.Menu>
                  <Dropdown.MenuItem.Button
                    className="text-right"
                    prefix={<Delete size={16} />}
                    style="danger"
                    onClick={() => setShowAlert(true)}
                  >
                    Delete
                  </Dropdown.MenuItem.Button>
                </Dropdown.Menu>
              </Dropdown>
            </>
          }
        />
        <div className="rounded-3xl border p-[3vw] shadow-lg">
          <Form
            categories={categories}
            description={description}
            selectedCategories={selectedCategories}
            setDescription={setDescription}
            setSelectedCategories={setSelectedCategories}
            setTitle={setTitle}
            title={title}
            type="update"
          />
        </div>
      </div>
      <Alert
        cancelButtonLabel="No"
        isOpen={showAlert}
        message="Are you sure you want to delete this post?"
        submitButtonLabel="Yes"
        title="Delete post"
        onClose={() => setShowAlert(false)}
        onSubmit={confirmDelete}
      />
    </Container>
  );
};

export default Edit;
