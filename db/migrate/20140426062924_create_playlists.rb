class CreatePlaylists < ActiveRecord::Migration
  def change
    create_table :playlists do |t|
      t.string :title
      t.string :url
      t.string :content_id
      t.float :order

      t.timestamps
    end
  end
end
