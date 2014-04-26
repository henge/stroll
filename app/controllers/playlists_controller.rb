class PlaylistsController < ApplicationController

  def index
    @playlists = Playlist.all
  end

  def show
    respond_to do |format|
      format.json do
        render json: Playlist.find_by(play_order: params[:play_order])
      end
    end
  end

  def next
    # 再生中の（もしくは再生が終了した）play_orderを取得して次に再生するコンテンツの情報をjsonで返す
    # next_order = params[:current_order].to_i + 1
    # @playlist = Playlist.find_by(play_order: next_order)
    respond_to do |format|
      format.json do
        render json: Playlist.next(params[:current_order].to_f)
      end
    end
  end

  def prev
    respond_to do |format|
      format.json do
        render json: Playlist.prev(params[:current_order].to_f)
      end
    end
  end

  # GET /playlists/new
  def new
    @playlist = Playlist.new
  end

  # POST /playlists
  # POST /playlists.json
  def create
    @playlist = Playlist.new(playlist_params)
    @last = Playlist.last
    if @last
      @playlist.play_order = @last.play_order + 1
    else
      @playlist.play_order = 1
    end

    respond_to do |format|
      if @playlist.save
        format.json { render json: @playlist }
      else
        format.json { render json: @playlist.errors, status: :unprocessable_entity }
      end
    end
  end

  def around
    respond_to do |format|
      format.json { render json: Playlist.around(params[:current_order].to_f)}
    end
  end

  def reset
    respond_to do |format|
      if Playlist.destroy_all
        format.json { head :no_content }
      else
        format.json { render json: @playlist.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @playlist = Playlist.find_by(play_order: params[:play_order])
    if @playlist
      @playlist.destroy
      respond_to do |format|
        format.json { render json: @playlist}
      end
    else
      render json: nil, status: :unprocessable_entity
    end
  end

  private

    # Never trust parameters from the scary internet, only allow the white list through.
    def playlist_params
      params.permit(:url, :play_order, :content_id, :title)
    end
end
